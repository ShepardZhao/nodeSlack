/**
 * @author shepard.zhao
 * @email zhaoxun321@gmail.com
 * @create date 2018-09-03 02:25:23
 * @modify date 2018-09-03 02:25:23
 * @desc [description]
 */

import Slack from "./slack";
import SocketClient from "./socket-client";
import Metrics from "./metrics";
import * as _ from "lodash";
import { exit } from "process";
const urlConfig = require("./config.json");

class App {
  /**
   * property
   */
  private socketClient: SocketClient;
  private slack: Slack;
  private metrics: Metrics;
  /**
   * constructor
   * @param socketUrl
   * @param slackToken
   */
  constructor(socketUrl: string, slackToken: string) {
    this.socketClient = new SocketClient(socketUrl);
    this.slack = new Slack(slackToken);
    this.metrics = new Metrics(socketUrl, this.slack);
  }

  /**
   * on listen socket
   */
  public onListenSocket(): void {
    // income socket message
    this.socketClient
      .getSocketClient()
      .on("TEMPLATE", async (res: any) => {
        if (res!.channel === this.slack.getChannel()) {
          const result: any = this.metrics.checkMetricsTypes(res);
          if (_.size(result) > 0) {
            // if is available then show the data
            await this.metrics.processStringify(result[0]);
          }
        }
      });

    this.socketClient.getSocketClient().on("CHAT", (res: any, err: Error) => {
      if (res!.queryID === "" && res!.creator === "bot") {
        this.slack.sendRTMSimpleMessage(res!.content);
      } else if (res!.queryID !== "" && res!.creator === "bot") {
        // send to template
        this.slack.sendRTMSimpleMessage(
          `Here is what I found for "${
            res!.content
          }". Please wait while result generating...`
        );
        this.slack.sendTypingStatus();
        this.socketClient.sendMessage("TEMPLATE", {
          queryID: res!.queryID,
          channel: this.slack.getChannel()
        });
      }
    });
  }

  /**
   * on listen slack message
   */
  public async onListenSlackMessage(): Promise<any> {
    // income slack message
    this.slack.getRTM().on("message", async (event: any) => {
      const channel: string = event!.channel;
      this.slack.setChannel(channel);
      const user: any = await this.slack.getUserInfo(event!.user);
      if (user!.ok) {
        if (user!.user!.profile!.real_name !== "iBot") {
          const nt: string = user!.user!.nt;
          this.socketClient.sendMessage("CHAT", {
            message: {
              _id: "",
              creator: `user_${nt}`,
              timestamp: new Date().getTime(),
              position: "right",
              nt: `${nt}`,
              content: event.text,
              token: ""
            },
            domain: []
          });
          this.slack.sendTypingStatus();
        }
      }
    });
  }
}

// main
try {

  const app = new App(urlConfig!.slackUrl, urlConfig!.slackBotToken); // slack token

  // start listen socket response message
  app.onListenSocket();

  // start listen slack response message
  app.onListenSlackMessage();
  
} catch (err) {
  console.log(`${<Error>err}`);
  exit(1);
}
