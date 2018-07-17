export default interface IStoreState {
  readonly session?: ISessionState;
  readonly registration?: IRegistrationState;
};

export interface ISessionState {
  readonly type?: string;
  readonly isAuthenticated?: boolean;
  readonly currentUser?: any;
  readonly socket?: any;
  readonly channel?: any;
  readonly error?: any;
};

export interface IRegistrationState {
  readonly type?: string;
  readonly errors?: any;
};