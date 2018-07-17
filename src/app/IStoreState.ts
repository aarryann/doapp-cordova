export default interface IStoreState {
  session: ISessionState,
};

export interface ISessionState {
  isAuthenticated: boolean,
  currentUser: string,
  socket: any,
  channel: any,
  error: any,
};