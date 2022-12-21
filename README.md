# Set Secret Action

Create or edit actions secrets in repository or organizations

## Usage

### Inputs

#### Modifying Repo Secrets

| name | type | required | description |
| --- | --- |:--- | --- |
| name | `String` | yes | secret name |
| value | `String` | yes | value of secret |
| token | `String` | yes | Repository [Access Token<sup>1</sup>](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) |
| repository | `String` | yes | ``${{ github.repository }}`` - repository you're trying to modify the secret of |

<sup>1:</sup> *this supports the currently beta scoped personal access tokens. Required scopes:  actions, secrets, and workflows: read and write*

#### Modifying Org Secrets

| name | type | required | description |
| --- | --- |:--- | --- |
| name | `String` | yes | secret name |
| value | `String` | yes | value of secret |
| token | `String` | yes | Repository [Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)<sup>2</sup> |
| org | `boolean` | yes | Must be set to true, otherwise this will fail. |
| org-name | `String` | yes | ``${{ GITHUB_REPOSITORY_OWNER }}`` - Org name of secret you're managing |
| visibility | `String` | no | default `'all'` - repositories this secret is visible to. |

<sup>2:</sup> *this supports the currently beta scoped personal access tokens. Required scopes:  organization admin, org secrets: read and write*

## Outputs

| name | description |
| :---: | :--- |
| status | HTTP Response status code |
| org / repo | says if the action updated a repo secret or an org secret.
| data | response json payload |

## Examples

*Note: these examples expect a secret with the name ``REPO_ACCESS_TOKEN`` that has a personal access token that has the appropriate scopes enabled on it.  Do not put that access token in cleartext!*

### For personal repo

```YAML
uses: texas-mcallen-mission/actions-secret-modifier@v2.0.0
with:
  name: 'MY_SECRET_NAME'
  value: 'Lorem ipsun dolor simit'
  repository: hmanzur/actions-set-secret
  token: ${{ secrets.REPO_ACCESS_TOKEN }}
```

### For organizations

```YAML
uses: texas-mcallen-mission/actions-secret-modifier@v2.0.0
with:
  name: 'MY_SECRET_NAME'
  value: 'Lorem ipsun dolor simit'
  token: ${{ secrets.REPO_ACCESS_TOKEN }} # Personal access token approved by your org.
  visibility: 'all'
  org: true
  org-name ${{ GITHUB_REPOSITORY_OWNER }}
```

## References

- [Get a repository public key](https://developer.github.com/v3/actions/secrets/#get-a-repository-public-key)
- [Create or update repository secret](https://developer.github.com/v3/actions/secrets/#create-or-update-a-repository-secret)
- [Get an organization public key](https://developer.github.com/v3/actions/secrets/#get-an-organization-public-key)
- [Create or update an organization secret](https://developer.github.com/v3/actions/secrets/#create-or-update-an-organization-secret)

## Attribution

Thanks to [hmanzur](https://github.com/hmanzur/) for the [repo](https://github.com/hmanzur/actions-set-secret) we forked this from!
