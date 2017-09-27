const { URL } = require('url')

const chalk = require('chalk')
const ora = require('ora')
const fetch = require('node-fetch')
const columnify = require('columnify')
const distanceInWordsToNow = require('date-fns/distance_in_words_to_now')

const clientInfo = require('../utils/client-info')
const headers = require('../utils/http-headers')

const getIndex = () => {
  return new Promise((resolve, reject) => {
    fetch(`${process.env.CALIBRE_HOST}/api/cli/runs`, { headers })
      .then(res => resolve(res.json()))
      .catch(reject)
  })
}

const formatRun = test => {
  const url = new URL(test.url)
  const formattedTestUrl = `${url.hostname}${url.pathname}`

  return `• ${chalk.bold(formattedTestUrl)} from ${test.location
    .emoji}  ${chalk.green(test.location.name)} ${distanceInWordsToNow(
    test.created_at
  )} ago (${chalk.grey(test.uuid)})`
}

const main = async args => {
  let index
  let spinner
  if (!args.json) {
    spinner = ora('Connecting to Calibre')
    spinner.color = 'magenta'
    spinner.start()
  }

  try {
    index = await getIndex()
    if (args.json) return console.log(JSON.stringify(index, null, 2))
  } catch (e) {
    process.exit()
  }

  spinner.stop()
  console.log(`${chalk.bold('♤  calibre')} test runs\n`)

  const rows = index.map(row => {
    const url = new URL(row.url)
    const formattedTestUrl = `${url.hostname}${url.pathname}`

    return {
      uuid: chalk.grey(row.uuid),
      url: formattedTestUrl,
      'test location': `${row.location.emoji}  ${row.location.name}`,
      device: row.device.title
    }
  })

  console.log(columnify(rows))
}

module.exports = {
  command: 'test-list',
  describe: 'Print a list of previously run tests',
  handler: main,
  builder: yargs => {
    yargs.option('json', {
      describe: 'Return the list of tests as JSON'
    })
  }
}
