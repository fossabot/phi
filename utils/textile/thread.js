import { Client, PrivateKey, ThreadID } from '@textile/hub';

import Textile from './base';
import Utils from '../index';
import Ceramic from '../ceramic';
import Ack from './thread/ack';
import Chat from './thread/chat';
import Loan from './thread/loan';
import Invite from './thread/invite';
import invites from '../../config/invites.json';

class Thread extends Textile {
  constructor() {
    super(Client, Thread);
  }

  static getInstance() {
    return (async () => {
      const obj = await new Thread().build();
      const ceramic = await Utils.getInstance(Ceramic);

      obj._ack = new Ack(obj.client, ceramic.address);
      obj._chat = new Chat(obj.client, ceramic.address);
      obj._invite = new Invite(obj.client, ceramic.address);
      obj._loan = new Loan(obj.client, ceramic.address);

      await obj._ack.load();
      await obj._invite.load();

      return obj;
    })();
  }

  static getClassName() {
    return 'Thread';
  }

  async join(callback, info = null) {
    this.client.joinFromInfo(info?.dbInfo || invites.dbInfo)
      .then(() => this.listen(callback, info?.threadID))
      .catch();
  }

  listen(callback, threadId = null) {
    const filters = [{ actionTypes: ['CREATE'] }];
    const threadID = ThreadID.fromString(threadId || invites.threadID);
    this.client.listen(threadID, filters, callback);
  }

  async getDBInfo(threadID) {
    const dbInfo = await this.client.getDBInfo(ThreadID.fromString(threadID));

    const result = {
      threadID,
      dbInfo
    };

    return Buffer.from(JSON.stringify(result)).toString('hex');
  }

  chat(threadID) {
    this._chat.setThreadId(threadID);
    return this._chat;
  }

  invite() {
    return this._invite;
  }

  ack() {
    return this._ack;
  }

  loan(threadID) {
    this._loan.setThreadId(threadID);
    return this._loan;
  }
};

export default Thread;

const TextileClient = {
  client: null,

  getClient: async () => {
    if (!TextileClient.client) {
      TextileClient.client = await Client.withKeyInfo({ key: process.env.TEXTILE_KEY, secret: '' });
      const identity = await PrivateKey.fromRandom();
      await TextileClient.client.getToken(identity);
    }

    return TextileClient.client;
  }
}


export const getTextileClient = TextileClient.getClient;
