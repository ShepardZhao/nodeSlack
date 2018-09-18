/**
 * @author shepard.zhao
 * @email zhaoxun321@gmail.com
 * @create date 2018-09-18 16:05:34
 * @modify date 2018-09-18 16:05:34
 * @desc [description]
*/

import * as exporter from "highcharts-export-server";
import * as base64Img from "base64-img";

class Diagram {
  constructor() {
    exporter.initPool();
  }
  public setDiagramConfig(sourceData: any): any {
    return {
      type: "jpg",
      options: {
        title: {
          text: sourceData!.title
        },
        xAxis: {
          categories: sourceData!.data!.xCategories
        },
        credits: {
          enabled: false
        },
        yAxis: [
          {
            title: {
              text: ""
            }
          }
        ],
        series: sourceData!.data!.series
      }
    };
  }
  private async getPromiseDiagram(diagramConfig: any): Promise<any> {
    return new Promise((resolve, rejects) => {
      exporter.export(diagramConfig, (err, res) => {
        if (err) {
          rejects(err);
        } else {
          resolve(res);
        }
      });
    });
  }
  public async exportDiagram(sourceData: any): Promise<any> {
    const result = await this.getPromiseDiagram(sourceData);
    const filePath = base64Img.imgSync(
      `data:image/png;base64,${result.data}`,
      "",
      sourceData!.options!.title!.text
    );
    //exporter.killPool();
    return filePath;
  }
}

export default Diagram;
