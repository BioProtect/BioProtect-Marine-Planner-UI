import { makeStore } from '@store/store'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { setCredentials } from './authSlice'
import { userApiSlice } from './userSlice'

function respond(status) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ error: 'nope' }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

async function requestAsLoggedInUser() {
  const store = makeStore()
  store.dispatch(setCredentials({ userId: 1, accessToken: 'tok', userData: {} }))
  await store.dispatch(userApiSlice.endpoints.resendPassword.initiate())
  return store
}

describe('apiSlice base query', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('logs the user out when the session is gone (401)', async () => {
    const fetchMock = respond(401)
    const store = await requestAsLoggedInUser()
    expect(store.getState().auth.isUserLoggedIn).toBe(false)
    expect(store.getState().api.queries).toEqual({})
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps the user logged in on a permission error (403)', async () => {
    const fetchMock = respond(403)
    const store = await requestAsLoggedInUser()
    expect(store.getState().auth.isUserLoggedIn).toBe(true)
    expect(Object.keys(store.getState().api.queries)).toHaveLength(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('sends the bearer token', async () => {
    const fetchMock = respond(200)
    await requestAsLoggedInUser()
    expect(fetchMock.mock.calls[0][0].headers.get('Authorization')).toBe('Bearer tok')
  })
})
