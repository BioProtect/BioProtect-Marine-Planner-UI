import { screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../test/renderWithProviders'
import ResendPasswordDialog from './ResendPasswordDialog'

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('resendPasswordDialog', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('enables Resend only once an email is entered', async () => {
    const { user } = renderWithProviders(<ResendPasswordDialog open />)
    const resend = screen.getByRole('button', { name: 'Resend' })
    expect(resend).toBeDisabled()
    await user.type(screen.getByLabelText('Email Address'), 'a@b.c')
    expect(resend).toBeEnabled()
  })

  it('calls the server and shows its reply', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ info: 'Not currently implemented' }))
    vi.stubGlobal('fetch', fetchMock)
    const { user } = renderWithProviders(<ResendPasswordDialog open />)

    await user.type(screen.getByLabelText('Email Address'), 'a@b.c')
    await user.click(screen.getByRole('button', { name: 'Resend' }))

    expect(await screen.findByText('Not currently implemented')).toBeInTheDocument()
    const request = fetchMock.mock.calls[0][0]
    expect(request.url).toContain('users?action=resend_password')
  })

  it('closes the dialog after a successful resend', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ info: 'ok' })))
    const { user, store } = renderWithProviders(<ResendPasswordDialog open />, {
      actions: [
        {
          type: 'ui/toggleDialog',
          payload: { dialogName: 'resendPasswordDialogOpen', isOpen: true },
        },
      ],
    })
    await user.type(screen.getByLabelText('Email Address'), 'a@b.c')
    await user.click(screen.getByRole('button', { name: 'Resend' }))
    await waitFor(() => expect(store.getState().ui.dialogStates.resendPasswordDialogOpen).toBe(false))
  })
})
