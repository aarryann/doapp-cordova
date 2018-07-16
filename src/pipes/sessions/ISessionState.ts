import IStoreState from '../../app/IStoreState';

export default interface IState extends IStoreState {
  session: ISessionState,
};

export interface ISessionState {
  currentUser: string,
  socket: any,
  channel: any,
  error: any,
};