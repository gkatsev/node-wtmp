#!/usr/bin/env node
var fs = require('fs')

exports.TYPE = [
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
  struct.offset = {
    start : offset
  }

  struct.type = wtmp.readUInt32LE(offset)
  struct.pid = wtmp.readUInt32LE(offset += 4)
  struct.tty = wtmp.toString('binary', offset += 4, (offset+=UT_LINESIZE))
  struct.tty = struct.tty.replace(/\u0000/g,'')
  struct.terminal_id = wtmp.toString('binary', offset, (offset+=4)).replace(/\u0000/g,'')

  struct.user = wtmp.toString('binary', offset, (offset+=UT_NAMESIZE)).replace(/\u0000/g,'')
  struct.host = wtmp.toString('binary', offset, (offset+=UT_HOSTSIZE)).replace(/\u0000/g,'')

  struct.exit = {}
  struct.exit.termination_status = wtmp.readUInt16LE(offset)
  struct.exit.exit_status = wtmp.readUInt16LE(offset += 2)

  struct.session_id = wtmp.readUInt32LE(offset += 2)

  struct.time = {}
  struct.time.seconds = wtmp.readUInt32LE(offset += 4)
  struct.time.microseconds = wtmp.readUInt32LE(offset += 4)

  offset += 4
  struct.ipv6 = []
  struct.ipv6[0] = []//wtmp.toString('binary', offset, (offset+=4))
  struct.ipv6[0][0] = wtmp.readUInt8(offset++)
  struct.ipv6[0][1] = wtmp.readUInt8(offset++)
  struct.ipv6[0][2] = wtmp.readUInt8(offset++)
  struct.ipv6[0][3] = wtmp.readUInt8(offset++)
  struct.ipv6[1] = wtmp.readUInt32LE(offset)
  struct.ipv6[2] = wtmp.readUInt32LE(offset += 4)
  struct.ipv6[3] = wtmp.readUInt32LE(offset += 4)
  struct.ipv4 = struct.ipv6[0]

  struct.unused = wtmp.toString('binary', offset += 4, (offset+=20)).replace(/\u0000/g,'')

  struct.offset.end = offset
  return struct
}

exports.parseWtmp = function(file){
  var wtmp = fs.readFileSync(file)
    , offset = 0
    , length = wtmp.length
    , parsedWtmp = []

  while(offset < length){
    var struct = readOneStruct(wtmp, offset)
    offset = struct.offset.end
    parsedWtmp.push(struct)
  }
  return parsedWtmp
}

if(require.main === module) {
  console.log(JSON.stringify(exports.parseWtmp(process.argv[2]), null, '  '))
}
