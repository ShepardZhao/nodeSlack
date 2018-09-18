
/**
 * @author shepard.zhao
 * @email zhaoxun321@gmail.com
 * @create date 2018-09-18 16:05:34
 * @modify date 2018-09-18 16:05:34
 * @desc [description]
*/


import * as _ from 'lodash';
import * as cTable from "console.table";
import Diagram from './diagram';
import Slack from './slack';
class Metrics {
    /**
     * property
     */
    private historiesMetricsIDs:any[] = [];
    private metricUrl:string;
    private queryID:string;
    private slack:Slack;
    private diagram:Diagram = new Diagram();

    /**
     * constructor
     * @param metricUrl 
     */
    constructor(metricUrl: string, slack: Slack){
        this.metricUrl = metricUrl;
        this.slack = slack;
    }

    
    /**
     * check metrics type
     */
    public checkMetricsTypes(message:any):any{
        let result:any = [];
        this.queryID = message!.queryID;
        const templates: any = message!.template!.templates;
        _.forEach(templates,(v:any,{})=>{
            _.forEach(v.atomicViews,(sv:any,{})=>{
                if (_.has(sv,'refreshDate')&&!_.includes(this.historiesMetricsIDs,sv.id)){
                    result.push(sv);
                    this.historiesMetricsIDs.push(sv.id);
                }
            });
        });

        if (_.size(result)>0){
            return result;
        }
        else{
            return '';
        }
    }

 

    /**
     * convert format integer
     * @param value 
     */
    private convertFormatInteger(value:number):string {
        let result = null
        if (value >= 1000000 || value <= -1000000) {
            result = (value / 1000000).toFixed(2) + 'M';
        } else if (value >= 1000 || value <= -1000) {
            result = (value / 1000).toFixed(2) + 'K';
        } else {
            result = (value).toFixed(0);
        }
        return result.toString();
    }

    /**
     * convert format percentage
     * @param value 
     */
    private convertFormatPercentage(value:number):string{
        return _.toString((value*100).toFixed(2)+'%');
    }


    /**
     * get prefix symbol
     * @param prefix 
     */
    private getPrefixSymbol(prefix:string):string{
        if (prefix !=='TO_BE_DONE'){
            return prefix;
        }
        else {
            return '';
        }
    }

    /**
     * get post fix symbol
     * @param postfix 
     */
    private getPostfixSymbol(postfix: string): string {
        if (postfix !== "TO_BE_DONE") {
            return postfix;
        }
        else {
            return '';
        }
    }

    /**
     * get get generated metrics url
     */
    private getGeneratedMetricsUrl(){
        return `${this.metricUrl}standalone/view/${this.queryID}-/?&isiHUB=false`;
    }

    /**
     * show cumulative range
     * @param latestDate 
     * @param cumulativeRange 
     * @param isCumulative 
     */
    private isCumulativeRange(latestDate: string, cumulativeRange:any,isCumulative:boolean):string{
        if (isCumulative){
            return `From: ${cumulativeRange[0]} To: ${cumulativeRange[1]}`;
        }
        else {
            return latestDate;
        }
    }
    /**
     * set mark value
     */
    private setFormatedValue(sourceValue:string, sourceDataType:string):string{
        if (sourceDataType ==='Integer'){
            return this.convertFormatInteger(_.toNumber(sourceValue));
        }
        else if (sourceDataType === 'Percentage') {
            return this.convertFormatPercentage(_.toNumber(sourceValue));
        }
        return '';
    }

    /**
     * fetch metric diagram
     */
    private async fetchMetricDiagram(data:any): Promise<any> {
        const getPath: any = await this.diagram.exportDiagram(this.diagram.setDiagramConfig(data));
        await this.slack.uploadFile(getPath);
    }

    /**
     * process metrics
     * @param data 
     */
    public async processStringify(item:any):Promise<any>{
        let tmpTitle: string = `\n Metrics Name: *${item.title}*`;
        let tmp: string = `${tmpTitle}\n Latest Refreshed Date:*${this.isCumulativeRange(item.refreshDate, item.cumulativeRange, item.cumulative)}*, and value is: *${this.getPrefixSymbol(item.prefix)}${this.setFormatedValue(item.refreshValue, item.dataType)}${this.getPostfixSymbol(item.postfix)} ${item.cumulative ? "(cumulative)" : ""}*\n`;
        this.slack.sendTypingStatus();
        this.slack.sendRTMSimpleMessage(tmp); // send basic info
        this.slack.sendTypingStatus();
        await this.fetchMetricDiagram(item);  // upload image
        // let tableMessage: string = `Here is the history data:\n`
        // let tmpData: any = [];
        // const tmpTrendData: any = item!.data!.series[0]!.data;
        // _.forEach(tmpTrendData, (sv: any, { }) => {
        //     tmpData.push({ Date: sv!.date, Value: `${this.setFormatedValue(sv!.y, item!.dataType)}`, isAbnormal: sv!.marker!.enabled ? 'Yes' : '' });
        // });
        // tableMessage+= "```\n" + cTable.getTable(tmpData) + "```" + `\nDetail: ${this.getGeneratedMetricsUrl()}\n\n`;
        // this.slack.sendRTMSimpleMessage(tableMessage);
    }
}

export default Metrics;