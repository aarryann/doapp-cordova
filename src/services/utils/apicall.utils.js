import { graphql, GraphQLSchema }   from 'graphql';
import { httpPost, httpGet }  from '.';

//const remoteBaseUrl = "http://10.0.2.2:4000/";
const remoteBaseUrl = "http://localhost:4000/";
export const apiCall = async ( resource, payload, source ) => {
  try{
    // If cordova mode
    if (source === 'local'){
      //console.log("Graphql Local call");
      const db = window.SDATA.conn;
      // local graphql call: schema, query, rootQuery, context, variables
      return graphql( payload.schema, payload.query, null, {db}, payload.values );
    } else if (source === 'post'){
      // Web mode
      const values = {
        session: payload.values
      };
      //console.log("Graphql Remote call");
      // remote http call
      return httpPost( remoteBaseUrl + resource, values );
    } else if (source === 'get'){
      // remote http call
      return httpGet( remoteBaseUrl + resource );
    }
  }
  catch(e){
    console.log("Error apiCall: " + e);
  }
}
