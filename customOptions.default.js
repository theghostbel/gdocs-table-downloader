module.exports = {
  getGoogleAuthCredentials: () => {
    return {
      private_key:  process.env.SERVICE_ACCOUNT_PRIVATE_KEY || '',
      client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL || ''
    }
    /* You can hardcode these values if your policies allow to store secrets in repo:
       return {
         private_key:  "-----BEGIN PRIVATE KEY-----\nL3OEUJ5OYH7F02I6KUAY\n-----END PRIVATE KEY-----\n",
         client_email: "this-is-fake@some-name-you-make.iam.gserviceaccount.com",
       }
    */
  },

  getValueMapper: value => {
    if (typeof value === 'undefined') return ''

    return value
  }
}
