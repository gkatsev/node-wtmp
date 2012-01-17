var fs = require('fs')

exports.UT_TYPE = [
  'EMPTY'
, 'RUN_LVL'
, 'BOOT_TIME'
, 'NEW_TIME'
, 'OLD_TIME'
, 'INIT_PROCESS'
, 'LOGIN_PROCESS'
, 'USER_PROCESS'
, 'DEAD_PROCESS'
, 'ACCOUNTING'
]

var UT_LINESIZE = 32
  , UT_NAMESIZE = 32
  , UT_HOSTSIZE = 256

function readOneStruct(wtmp, offset){
  var struct = {}
  struct.offset = {}
  struct.offset.start = offset

  struct.ut_type = wtmp.readUInt32LE(offset)
  offset += 4
  struct.ut_pid = wtmp.readUInt32LE(offset)
  offset += 4
  struct.ut_line = wtmp.toString('binary', offset, (offset+=UT_LINESIZE))
  struct.ut_line = struct.ut_line.replace(/\u0000/g,'')
  struct.ut_id = wtmp.toString('binary', offset, (offset+=4)).replace(/\u0000/g,'')
  struct.ut_user = wtmp.toString('binary', offset, (offset+=UT_NAMESIZE)).replace(/\u0000/g,'')
  struct.ut_host = wtmp.toString('binary', offset, (offset+=UT_HOSTSIZE)).replace(/\u0000/g,'')
  struct.ut_exit_termination = wtmp.readUInt16LE(offset)
  offset += 2
  struct.ut_exit_exit = wtmp.readUInt16LE(offset)
  offset += 2
  struct.ut_session = wtmp.readUInt32LE(offset)
  offset += 4
  struct.ut_tv_sec = wtmp.readUInt32LE(offset)
  offset += 4
  struct.ut_tv_usec = wtmp.readUInt32LE(offset)
  offset += 4
  struct.ut_addr_v6 = []
  struct.ut_addr_v6[0] = wtmp.readUInt32LE(offset)
  offset += 4
  struct.ut_addr_v6[1] = wtmp.readUInt32LE(offset)
  offset += 4
  struct.ut_addr_v6[2] = wtmp.readUInt32LE(offset)
  offset += 4
  struct.ut_addr_v6[3] = wtmp.readUInt32LE(offset)
  offset += 4
  struct.__unused = wtmp.toString('binary', offset, (offset+=20)).replace(/\u0000/g,'')

  struct.offset.end = offset
  return struct
}

exports.parseWtmp = function(file){
  var wtmp = fs.readFileSync(file)
  var foo = readOneStruct(wtmp, 0)
  console.log(foo)
  return foo
}
