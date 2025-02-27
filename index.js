/* eslint-disable quotes */
/* eslint-disable indent */
const Core = require('@actions/core')
const Api = require('./src/api')

/**
 * Set secrets in Github repo
 * This actions is participating in #ActionsHackathon 2020
 *
 * @param {Api} api - Api instance
 * @param {string} secret_name - Secret key name
 * @param {string} secret_value - Secret raw value
 * @param {boolean} is_debug  - discards the stuff that requires running inside of a Github action for context data.
 * @see https://developer.github.com/v3/actions/secrets/#create-or-update-an-organization-secret
 * @see https://dev.to/devteam/announcing-the-github-actions-hackathon-on-dev-3ljn
 * @see https://dev.to/habibmanzur/placeholder-title-5e62
 */
async function boostrap(api, secret_name, secret_value, is_debug = false){
  try {
    let fancyTextTreatment = '\u001b[3m'
    if (api.isOrg()) {
      if (!is_debug) {
        Core.info(fancyTextTreatment + ' Updating Org Secret')
      } else {
        console.log("Updating Org Secret")
      }
    } else {
      if (!is_debug) {
        Core.info(fancyTextTreatment + ' Updating Repo Secret')
      } else {
        console.log("Updating Repo Secret")
      }
    }
    const {key_id, key} = await api.getPublicKey()
    Core.info('Public key obtained.')
    const data = await api.createSecret(key_id, key, secret_name, secret_value)

    if (api.isOrg()) {
      if (!is_debug) {
        data.visibility = Core.getInput('visibility')
      } else {
        data.visibility = 'all'
      }
      // don't need a debug check here because data.visibility is hardcoded to all
      if (data.visibility === 'selected') {
        data.selected_repository_ids = Core.getInput('selected_repository_ids')
      }
    }

    const response = await api.setSecret(data, secret_name)

    console.error(response.status, response.data)
      if (!is_debug) {
        if (response.status >= 400) {
          Core.setFailed(response.data)
        } else {
          Core.setOutput('status', response.status)
          Core.setOutput('data', response.data)
        }
      } else {
        if (response.status >= 400) {
          console.error("Yeah, it no workey")
        } else {
          console.log("Run Succeeded!")
        }
    }

  } catch (e) {
    if (!is_debug) {
      Core.setFailed(e.message)
    } else {
      console.log(e.message)
    }
    console.error(e)
  }
}


try {
  // `who-to-greet` input defined in action metadata file
  const name = String(Core.getInput('name')).trim()
  const value = String(Core.getInput('value')).trim()
  const repository = String(Core.getInput('repository')).trim()
  const token = Core.getInput('token')
  const org = String(Core.getInput('org')).trim()
  let api
  if (Core.getInput('org-name') !== "") {
    let org_name = String(Core.getInput('org-name')).trim()
    api = new Api(token, org_name, true, org_name)
  } else {
    api = new Api(token, repository, !!org)
  }

  boostrap(api, name, value)

} catch (error) {
  // console.log((error))
  Core.setFailed(error.message)
}

