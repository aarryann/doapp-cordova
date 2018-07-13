export default function DB(dbObject){
  this.db = dbObject;
}

DB.prototype.executeSql = function(...args){
  return new Promise((resolve, reject) => {
    this.db.executeSql(...args, d => { resolve(d) }, e => { reject(e) });
  });
}

DB.prototype.sqlBatch = function(...args){
  return new Promise((resolve, reject) => {
    this.db.sqlBatch(...args, d => { resolve(d) }, e => { reject(e) });
  });
}

DB.prototype.sqlIterator = function(rows) {
  return new SQLIterator(rows);
};

function SQLIterator(rows) {
  this.rows = rows;
}

SQLIterator.prototype[Symbol.iterator] = function*() {
  for (var i = 0, l = this.rows.length; i < l; i++) {
    yield this.rows.item(i);
  }
};

