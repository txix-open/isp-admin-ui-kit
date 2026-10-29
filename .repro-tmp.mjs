import React from 'react'
import { renderToString } from 'react-dom/server'
import { ReactJsonView } from 'isp-ui-kit'

const config = {
  dailyLimits: [{ applicationId: 13, requestsPerDay: 10000 }],
  forwardReqIdClientSettings: [
    { applicationId: 1, forwardRequestId: true },
    { forwardRequestId: true, applicationId: 32 },
    { applicationId: 33, forwardRequestId: true },
    { forwardRequestId: true, applicationId: 34 },
    { applicationId: 35, forwardRequestId: true }
  ],
  http: { proxyTimeoutInSec: 60, maxRequestBodySizeInMb: 64 },
  logging: {
    logLevel: 'debug',
    requestLogEnable: true,
    skipBodyLoggingEndpointPrefixes: [
      'admin',
      'debates/upload',
      'districts/upload_debates_districts',
      'scopes/upload',
      'system'
    ],
    bodyLogEnable: true,
    enableForceUnescapingUnicode: true
  },
  throttling: [{ requestsPerSeconds: 100, applicationId: 13 }],
  caching: { authorizationDataInSec: 60, authenticationDataInSec: 60 }
}

// RTK Query в dev deep-freeze'ит кэш (immutableStateInvariantMiddleware)
const frozen = JSON.parse(JSON.stringify(config))
const deepFreeze = (o) => {
  Object.values(o).forEach((v) => {
    if (v && typeof v === 'object') deepFreeze(v)
  })
  return Object.freeze(o)
}
deepFreeze(frozen)

try {
  const html = renderToString(
    React.createElement(ReactJsonView, {
      theme: '',
      src: frozen,
      name: null,
      displayObjectSize: false,
      enableClipboard: true,
      sortKeys: true,
      displayDataTypes: false,
      editKeys: false,
      collapsed: 1
    })
  )
  console.log('RENDER OK, length:', html.length)
} catch (e) {
  console.log('RENDER THREW:', e.message)
}
