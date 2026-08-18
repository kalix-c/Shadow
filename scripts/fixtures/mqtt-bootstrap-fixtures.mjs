export const mqttBootstrapFixtures = Object.freeze({
  modernEscaped: {
    html: '{"app_id":"test","endpoint":"wss:\\/\\/relay.invalid\\/chat?region=north","iris_seq_id":"111111"}',
    expected: {
      endpoint: "wss://relay.invalid/chat?region=north",
      sequenceId: "111111",
      region: "NORTH"
    }
  },
  legacyInline: {
    html: 'irisSeqID:"222222",appID:test,endpoint:"wss://relay.invalid/chat?region=west"',
    expected: {
      endpoint: "wss://relay.invalid/chat?region=west",
      sequenceId: "222222",
      region: "WEST"
    }
  },
  htmlQuoteEntities: {
    html: 'iris_seq_id=&quot;333333&quot;,endpoint=&quot;wss://relay.invalid/chat?region=east&quot;',
    expected: {
      endpoint: "wss://relay.invalid/chat?region=east",
      sequenceId: "333333",
      region: "EAST"
    }
  },
  missingSequence: {
    html: 'endpoint:"wss://relay.invalid/chat?region=north"',
    expected: null
  },
  missingRegion: {
    html: 'iris_seq_id:"444444",endpoint:"wss://relay.invalid/chat"',
    expected: null
  },
  nonWebSocketEndpoint: {
    html: 'iris_seq_id:"555555",endpoint:"https://relay.invalid/chat?region=north"',
    expected: null
  },
  empty: {
    html: "",
    expected: null
  },
  zeroSequence: {
    html: 'iris_seq_id:"0",endpoint:"wss://relay.invalid/chat?region=north"',
    expected: null
  },
  invalidRegion: {
    html: 'iris_seq_id:"666666",endpoint:"wss://relay.invalid/chat?region=north%20west"',
    expected: null
  }
});
