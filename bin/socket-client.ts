/**
 * @author xunzhao
 * @email xunzhao@ebay.com
 * @create date 2018-09-03 02:25:31
 * @modify date 2018-09-03 02:25:31
 * @desc [description]
 */
import * as io from "socket.io-client";
import { Socket } from "dgram";

class SocketClient {
  /**
   * properties
   */
  private socketClient: any;

  /**
   * constructor
   * @param url
   */
  constructor(url: string) {
    this.socketClient = io.connect(url, { forceNew: true, secure: true, rejectUnauthorized:false});
    this.onListenConnection();
    this.onListenDisconnection();
    this.onListenFailure();
  }

  /**
   * get SocketClient instance
   */
  public getSocketClient(): Socket {
    return this.socketClient;
  }

  /**
   * on listen failure connection
   */
  private onListenFailure():void{
    this.socketClient.on("connect_failed", (err:Error) => {
      console.warn(err);
    });
  }

  /**
   * on listen connection
   */
  private onListenConnection(): void {
    this.socketClient.on("connect", () => {
      console.log("socket-client connected!");
    });
  }

  /**
   * on listen disconnection
   */
  private onListenDisconnection(): void {
    this.socketClient.on("disconnect", () => {
      console.log("socket-client disconnect!");
    });
  }

  /**
   * send message
   * @param message 
   */
  public sendMessage(channel:string, message:any):void{
    this.socketClient.emit(channel, message);
  }
}
export default SocketClient;
