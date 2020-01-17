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
const download = require('download-git-repo');


const rm = require('rimraf').sync
const fs = require('fs');

// 先检查是否存在
// 如不存在则生成
// 如果是offline
// 检查是否有目标模板

const templatePath = path.join(home, '.bolhi');

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
    init(options);
  })

const init = ({offline}) => {
  if(offline) {

  } else {
    gitDownload('direct:http://git.wanshifu.com/user-web/tracker.git#user', templatePath, true, () => {
      generator();
    })
  }
}
const generator = () => {
  const metalsmith = Metalsmith(templatePath);
  metalsmith.use(ask(OPTIONS.prompts))
    .use(logger('config : '))
    .use(filter())
    .source('.')
    .destination(projectPath())
    .build(err => {
      if(err) console.log('err',err)
    })
}

const logger = (name) => {
  return (files, metal, next) => {
    let data = metal.metadata();
    try {
      data = JSON.stringify(metal.metadata());
    } catch {
      data = data;
    }
    console.log(name , data);
    next();
  }
}


const ask = (prompts) => {
  return (files, metalsmith, done) => {
    async.eachSeries(Object.keys(prompts), (key, next)=> {
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
    // console.log('answers',answers);
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

const gitDownload = (repo, path, clone, cb) => {
  // download(repository, destination, options, callback)
  const spinner = ora(chalk.blue('downloading...'));
  spinner.start();
  if(fs.existsSync(path)) rm(`${path}`);
  download(`${repo}`, path, { clone }, err => {
    spinner.stop();
    const msg = err ? `Template download error ! \n ${err.message}` : 'Template download success !'
    const color = err ? 'red' : 'green';
    console.log(chalk[color](msg));
    cb && cb();
  })
}

const filter = () => {
  return (files, metal, next) => {
    console.log('files',files);
  }
}
program.parse(process.argv);