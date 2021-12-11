import React from 'react'
import { Grid, Button } from '@mui/material'
import { ACTIONS, useGlobalValues } from './App'

function OperationButton({ operation }) {
  const { off, dispatch } = useGlobalValues()

  return (
    <>
      <Grid item xs={3}>
        <Button variant='outlined' sx={{ fontWeight: '600' }} onClick={() => dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: operation } })} disabled={off}>{operation}</Button>
      </Grid>
    </>
  )
}

export default OperationButton