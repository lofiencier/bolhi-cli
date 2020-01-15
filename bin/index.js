const program = require('commander');
const ora = require('ora');
const chalk = require('chalk');
const packageConfig = require('../package.json');
const async = require('async');
const OPTIONS = require('./options');
const Metalsmith = require('metalsmith');
const path = require('path');
const inquirer = require('inquirer');
const home = require('user-home');

const exists = require('fs').existsSync;


const tempPath = path.join(home, '.commandar');
const projectPath = (name = 'my-project') => path.resolve(name);

program.version(packageConfig.version).usage('<command> [options]');

// 相当于*
program.arguments('<commands>').action(cmd => {
  // unkown command: output help 
  program.outputHelp();
});

program.command('init [project-name]')
  .description('create a project')
  .action(function(name,options){
    console.log(chalk.blue('> Init started '));
    generator(tempPath);
  })



const generator = (projectPath) => {
  const metalsmith = Metalsmith(tempPath);
  metalsmith.use(ask(OPTIONS.prompts))
    .use(cosoleInputs())
    .source('.')
    .destination(projectPath)
    .build((err, files) => {
      if(err) console.log(err);
    })
}
const cosoleInputs = () => {
  return (files, metalsmith, done)=>{
    const data = metalsmith.metadata();
    console.log('data',data);
    done();
  }
}

const ask = (prompts) => {
  return (files, metalsmith, done) => {
    async.eachSeries(Object.keys(prompts), (key,next)=> {
      prompt(metalsmith.metadata(), key, prompts[key], next);
    }, done);
  }
}

const prompt = (data, key, prompt, done) => {
  // console.log('prompt',prompt);
  inquirer.prompt({
    type: prompt.type,
    name: key,
    message: prompt.message || prompt.label || key,
    default: prompt.default,
    choices: prompt.choices || [],
    validate: prompt.validate || (() => true)
  }).then(answers => {
    console.log('answers',answers);
    if(Array.isArray(answers[key])) {
      data[key] = {};
      answers[key].forEach(multiChoiceAnswer => {
        data[key][multiChoiceAnswer] = true;
      })
    } else if(typeof answers[key] === 'string') {
      data[key] = answers[key].replace(/"/g, '\\');
    } else{
      data[key] = answers[key];
    }
    done();
  }).catch(done)
}


program.parse(process.argv);