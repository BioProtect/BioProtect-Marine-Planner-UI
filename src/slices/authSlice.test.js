import { describe, expect, it } from 'vitest'

import reducer, { logOut, selectCurrentUserId, selectIsUserLoggedIn, setCredentials } from './authSlice'

describe('authSlice', () => {
  const credentials = setCredentials({
    userId: 7,
    accessToken: 'tok',
    userData: { username: 'ann' },
  })

  it('stores credentials and marks the user logged in', () => {
    const auth = reducer(undefined, credentials)
    expect(auth).toEqual({
      userId: 7,
      token: 'tok',
      userData: { username: 'ann' },
      isUserLoggedIn: true,
    })
    expect(selectCurrentUserId({ auth })).toBe(7)
    expect(selectIsUserLoggedIn({ auth })).toBe(true)
  })

  it('logOut resets to the initial state', () => {
    expect(reducer(reducer(undefined, credentials), logOut())).toEqual(reducer(undefined, { type: '@@init' }))
  })
})
