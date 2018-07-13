import DB from './promised.db.js';
//import 'babel-polyfill';
import AppConstants from '../../pipes/app/constants.app';

window.SDATA = window.SDATA || {};

export const getConnection = async() => {
  if(!window.SDATA.conn){
    return openDB('doapp.db').then( db => (window.SDATA.conn = new DB(db)));
  } else {
    return window.SDATA.conn;
  }
}

const getConfig = (...args) => {
  //Upgrade mode: 0-script incremental, 1-remove and refresh with script, 2-force refresh
  return new Promise((resolve, reject) => {
    resolve({appVersion: '0.1', dbVersion: '0.2', dbName: 'doapp.db', dbUpgradeMode: '0'});
  });
  /*
  return new Promise((resolve, reject) => {
    window.CustomConfigParameters.get( configData => {
      resolve(configData);
    }, err => {
      reject(err);
    }, [...args]);
  });
  */
}

const openDB = (dbName) => {
  return new Promise((resolve, reject) => {
    window.sqlitePlugin.openDatabase({name: dbName, location: 'default' }, db => { resolve(db) }, e => { reject(e) });
  });
}

export const loadDB = async (dbName) => {
  console.log(`${Date.now()}:LocalDBService: loadDB - ${window['_cordovaNative']}`);
  const configData = await getConfig("appVersion", "dbVersion", "dbName", "dbUpgradeMode");
  //Force refresh
  if( configData.dbUpgradeMode === '2' ){
    configData.oldDBVersion = 0;
    await importDB(configData);
    return;
  }
  const db = await getConnection();

  db.executeSql("SELECT * FROM app_versions WHERE avr_status = 'Current'", [])
  .then(d => {
    console.log(d.rows.item(0).AVR_DB_VER);
    console.log(configData.dbVersion);
    let upgrade = false;

    if (d.rows.length === 0){
      upgrade = true;
      configData.oldDBVersion = 0;
    } else {
      if(parseFloat(d.rows.item(0).AVR_DB_VER) < parseFloat(configData.dbVersion)){
        upgrade = true;
        configData.oldDBVersion = parseFloat(d.rows.item(0).AVR_DB_VER);
      }
    }

    if(upgrade){
      importDB(configData);
      console.log("Upgrade needed");
    } else {
      console.log("No upgrade needed");
    }
  }).catch( e => {
      console.log("Error in LoadDB");
      console.log(e);
      configData.oldDBVersion = 0;
      importDB(configData);
  });
}

const importDB = async (configData) => {
  console.log(`${Date.now()}:LocalDBService: importDB - ${window['_cordovaNative']}`);
  try{

    //Upgrade mode: 0-script incremental, 1-remove and refresh with script, 2-force refresh
    if( configData.dbUpgradeMode === '1' || configData.dbUpgradeMode === '2' ){
      try{
        await removeDB(configData.dbName);
      }catch(e){
        console.log('Error in RemoveDB ');
        console.log(e);
      }
    }

    await upgradeDB(configData);
    registerDB(configData);
  }catch(e){
    console.log('Error in importDB ');
    console.log(e);
  }
}

const registerDB = async (configData) => {
  const db = await getConnection();
  const rs = await db.executeSql("SELECT avr_id FROM app_versions WHERE avr_app_ver = ? AND avr_db_ver = ?",
    [configData.appVersion, configData.dbVersion]);
  await db.executeSql("UPDATE app_versions SET avr_status = 'Active' WHERE avr_status = 'Current'", [] );
  if (rs.rows.length === 0){
    const inserted = await db.executeSql("INSERT INTO app_versions (avr_app_ver, avr_db_ver, avr_upgrade_mode, avr_status) VALUES (?, ?, ?, ?) ",
      [configData.appVersion, configData.dbVersion, configData.dbUpgradeMode, 'Current']);
  }
  else {
    await db.executeSql("UPDATE app_versions SET avr_status = 'Current' WHERE avr_id = ?", [configData.appVersion, configData.dbVersion, rs.rows.item(0).avr_id]);
  }
}

const upgradeDB = async (configData) => {
  const db = await getConnection();
  let allVersions = AppConstants.DB_VERSIONS;
  console.log(allVersions);
  allVersions = allVersions.filter( e => e > configData.oldDBVersion && e <= parseFloat(configData.dbVersion) );
  console.log(allVersions);
  allVersions.forEach( async (e, i) => {
    console.log("DB_SCRIPT_" + e.toString().replace('.', '_'));
    await db.sqlBatch(AppConstants["DB_SCRIPT_" + e.toString().replace('.', '_') ]);
  } );
}

const copyDB = dbName => {
  console.log(`${Date.now()}:LocalDBService: removeDB - ${window['_cordovaNative']}`);

  return new Promise((resolve, reject) => {
    window.plugins.sqlDB.copy(dbName, 2, (d) => {
      console.log('DB COPY SUCCESS:', d);
      resolve(d);
    }, (e) => {
      console.log('DB COPY ERROR:', JSON.stringify(e));
      reject(e);
    });
  });
}

const removeDB = async (dbName) => {
  console.log(`${Date.now()}:LocalDBService: removeDB - ${window['_cordovaNative']}`);
  const db = await getConnection();
  await db.db.close();

  return new Promise((resolve, reject) => {
    window.plugins.sqlDB.remove(dbName, 2, (d) => {
      console.log('DB REMOVE SUCCESS:', d);
      window.SDATA.conn = null;
      setTimeout(() => {
        resolve(d);
      }, 3000);
    }, (e) => {
      console.log('DB REMOVE ERROR:', JSON.stringify(e));
      reject(e);
    });
  });
}
