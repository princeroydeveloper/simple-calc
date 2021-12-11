import React from 'react'
import { Grid, Button } from '@mui/material'
import { ACTIONS, useGlobalValues } from './App'

function DigitButton({ digit }) {
  const { off, dispatch } = useGlobalValues()

  return (
    <>
      <Grid item xs={3}>
        <Button variant='text' sx={{ fontWeight: '600' }} onClick={() => dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: digit } })} disabled={off}>{digit}</Button>
      </Grid>
    </>
  )
}

export default DigitButton