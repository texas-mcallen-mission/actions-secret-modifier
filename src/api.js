const { Octokit } = require('@octokit/core')
const sodium = require('libsodium-wrappers')
const Core = require('@actions/core')
/**
 * @class Api
 */
module.exports = class Api {
  /**
   * Generate public key to store secrets
   *
   * @param {any} auth - Auth method
   * @param {string} repo - Repository in format username/repo-name
   * @param {boolean} org - Is a Organization (OPTIONAL!)
   * @param {string} org_name - organization name (OPTIONAL as long as org is false)
   * @returns {Promise<{data: object}>} - Fetch response
   */
  constructor(auth, repo, org, org_name) {
    console.log('ORG_NAME:', org_name)
    console.log('REPO', repo)
    this.octokit = new Octokit({ auth })
    this._repo = repo
    this._base = 'repos'
    if (org !== undefined && org === true) {
      this._org = org
      this._org_name = org_name
      this._base = 'orgs'
    }

  }

  /**
   * Generate public key to store secrets
   *
   * @returns {Promise<{data: object}>} - Fetch response
   */
  async getPublicKey() {
    // let request_string = 'GET /' + this._base
    if (this._org) {
      console.log('OOOORG NAME', this._org_name)

      console.log('test')
      let splitString = this._org_name.split('/')
      let { data } = await this.octokit.request('GET /orgs/{org_name}/actions/secrets/public-key', {
        org_name: splitString[0].trim()

      })
      return data
    } else {
      let ownerName = this._repo.split('/')[0]
      let repoName = this._repo.split('/')[1]
      Core.info('repo fullString:: ' + this._repo + ownerName + ', ' + repoName)
      //   let testString = 'GET /' + String(this._base).trim() + '/' + String(this._repo).trim() + '/actions/secrets/public-key'
      let { data } = await this.octokit.request('GET /{base}/{owner}/{repo}/actions/secrets/public-key' /* testString*/, {
        base: this._base,
        owner: ownerName,
        repo: repoName
      })

      return data
    }
  }

  /**
   * Create encrypt secret
   *
   * @param {string} key_id - Secret key id
   * @param {string} key - Secret key
   * @param {string} name - Secret name
   * @param {string} value - Secret value
   * @returns {{key_id: string, encrypted_value: string}} - Secret data
   */
  async createSecret(key_id, key, name, value) {
    const messageBytes = Buffer.from(value)

    const keyBytes = Buffer.from(key, 'base64')

    const encryptedBytes = sodium.crypto_box_seal(messageBytes, keyBytes) // thanks to https://github.com/github/tweetsodium/blob/main/README.md

    return {
      encrypted_value: Buffer.from(encryptedBytes).toString('base64'),
      key_id
    }
  }

  /**
   * Set secret on repository
   *
   * @param {{encrypted_value:string, key_id:string}} data - Object data to request
   * @param {string} name - Secret name
   * @returns {Promise} - Fetch Response
   */
  async setSecret(data, name) {
    if (this.isOrg()) {
      return this.octokit.request('PUT /orgs/{org_name}/actions/secrets/{name}', {
        org_name: this._org_name,
        name: name,
        data
      })
    } else {
      let split_args = String(this._repo).split('/')
      Core.info('split_args: ' + split_args[0] + ', ' + split_args[1] + ' SECRET_NAME: ' + name)
      return this.octokit.request('PUT /{base}/{owner}/{repo}/actions/secrets/{name}', {
        base: 'repos',
        owner: split_args[0],
        repo: split_args[1],
        name,
        data
      })
    }
  }


  /**
   * Organization checker
   *
   * @returns {boolean} - Is organization
   */
  isOrg() {
    return this._org
  }
}
