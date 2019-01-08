const Iota = require('iota.lib.js')
const Curl = require('curl.lib.js')
const Mam = require('./lib/mam.client.js')

module.exports = class Client {
  constructor (node, seed) {
    this.iota = new Iota({ provider: node })
    Curl.overrideAttachToTangle(this.iota)

    this.state = Mam.init(this.iota)
    this.state.seed = seed
    Mam.changeMode(this.state, 'public')
  }

  async send (data, counter) {
    this.state.channel.start = counter
    const channel = Mam.create(
      this.state,
      this.iota.utils.toTrytes(data)
    )

    await Mam.attach(
      channel.payload,
      channel.address
    )

    return channel.root
  }

  async retreive (root) {
    let messages = []

    await Mam.fetch(
      root,
      'public',
      null,
      data => messages.push(this.iota.utils.fromTrytes(data))
    )

    return messages
  }
}