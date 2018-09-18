/**
 * @author shepard.zhao
 * @email zhaoxun321@gmail.com
 * @create date 2018-09-18 16:05:34
 * @modify date 2018-09-18 16:05:34
 * @desc [description]
*/
import { RTMClient, WebClient } from "@slack/client";
import * as axios from "axios";
import * as fs from "fs";
import * as slackUpload from "node-slack-upload";
class Slack {
  /**
   * property
   */
  private channel: string;
  private rtm: RTMClient;
  private web: WebClient;
  private api: string = "https://slack.com/api";
  private token: string;

  /**
   * constructor
   * @param token
   */
  constructor(token: string) {
    this.rtm = new RTMClient(token);
    this.web = new WebClient(token);
    this.token = token;
    this.startSlackClient();
  }

  /**
   * get user info api
   * @param user
   */
  public async getUserInfo(user: string): Promise<any> {
    const response = await axios.default.get(
      `${this.api}/users.info?token=${this.token}&user=${user}`
    );
    const data = response.data;
    return data;
  }

  /**
   * set channel
   * @param channel
   */
  public setChannel(channel: string): void {
    this.channel = channel;
  }

  /**
   * get channel
   */
  public getChannel(): string {
    return this.channel;
  }

  /**
   * get RTM instance
   */
  public getRTM(): RTMClient {
    return this.rtm;
  }

  /**
   * start slack client
   */
  private startSlackClient(): void {
    this.rtm.start();
    this.rtm.on("ready", event => {
      console.info("slack RTM connected!");
    });
  }


  public async uploadFile(filePath: string): Promise<any> {
    return new Promise((resolve, rejects) => {
      new slackUpload(this.token).uploadFile(
        {
          file: fs.createReadStream(filePath),
          filetype: "jpg",
          channels: this.channel
        },
        (err, res) => {
          if (err) {
            rejects(err);
          } else {
            resolve(res);
            fs.unlinkSync(filePath);
          }
        }
      );
    });
  }
 

  /**
   * send message out
   * @param message
   */
  public sendRTMSimpleMessage(message: string): void {
    this.rtm.sendMessage(message, this.channel);
  }

  public sendWebCustomMessage(msg: any, isAttachment: boolean): void {
    let message: any = {};
    message.mrkdwn = true;
    if (isAttachment) {
      message.text = "";
      message.attachments = msg;
    } else {
      message.text = msg;
      message.attachments = [];
    }
    message.channel = this.channel;
    this.web.chat.postMessage(message);
  }

  /**
   * send typing status
   */
  public sendTypingStatus(): void {
    this.rtm.sendTyping(this.channel);
  }
}

export default Slack;
