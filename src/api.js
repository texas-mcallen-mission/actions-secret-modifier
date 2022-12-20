const { Octokit } = require('@octokit/core')
const sodium = require('libsodium-wrappers')

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
      console.log('REPO',repo)
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
      let { data } = await this.octokit.request('GET /orgs/{org_name}/actions/secrets/public-key', {
        org_name: this._org_name
      })
      return data
    } else {
        let testString = 'GET /' + String(this._base).trim() + "/" + String(this._repo).trim() + "/actions/secrets/public-key"
      let { data } = await this.octokit.request(/*'GET /:base/:repo/actions/secrets/public-key'*/ testString, {
        base: this._base,
        repo: this._repo
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
      let test22 = this._repo.replaceAll("%2F","/")
      return this.octokit.request('PUT /{base}/{repo}/actions/secrets/{name}', {
        base: this._base,
        repo: test22,
        name: name,
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
