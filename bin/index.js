const program = require('commander');

program.command('init [project-name]')
  .description('create a project')
  .option('-c, --clone',`it will clone from ${tmpUrl}`)
  .option('--offline','use cached template')
  .action(function(name,options){
    console.log('we are trying to create "%s"...', name);
    download
  })