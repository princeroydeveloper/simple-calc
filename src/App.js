import React, { useContext, useEffect, useReducer, useState } from 'react'
import { Grid, Card, Container, CardContent, TextField, Typography, createTheme, ThemeProvider, Button } from '@mui/material'
import DigitButton from './DigitButton'
import OperationButton from './OperationButton'

const GlobalContext = React.createContext()

export function useGlobalValues() {
  return useContext(GlobalContext)
}

export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate',
  RND: 'random',
  MPLUS: 'm-plus',
  MMINUS: 'm-minus',
  MRECALL: 'm-recall',
  MCLEAR: 'm-clear',
  SETMEMORYTHERE: 'set-memory-there',
  TURN_ON_CALC: 'turn-on-calc'
}

const LOCAL_STORAGE_KEY = 'simple-calc-memory'

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.currentOperand.length === 12) return state
      if ((state.currentOperand === '0' && payload.digit === '.') || (state.currentOperand === '' && payload.digit === '.') || (state.overwrite && payload.digit === '.')) {
        return {
          ...state,
          currentOperand: '0.',
          uiCurrentOperand: '0.',
          overwrite: false,
          uiCurrentOperandOverwrite: false
        }
      }
      if (state.overwrite) {
        if (payload.digit === '00') {
          return {
            ...state,
            currentOperand: '',
            uiCurrentOperand: '0',
            overwrite: false,
            uiCurrentOperandOverwrite: false
          }
        }
        return {
          ...state,
          currentOperand: payload.digit,
          uiCurrentOperand: payload.digit,
          overwrite: false,
          uiCurrentOperandOverwrite: false
        }
      }

      if (payload.digit === '0' && state.currentOperand === '0') return state
      if (payload.digit === '.' && state.currentOperand.includes('.')) return state
      if ((state.currentOperand === '' && payload.digit === '00') || (state.currentOperand === '0' && payload.digit === '00')) return state
      if (state.currentOperand.length === 11 && payload.digit === '00') {
        return {
          ...state,
          currentOperand: `${state.currentOperand}0`,
          uiCurrentOperand: `${state.uiCurrentOperand}0`,
          uiCurrentOperandOverwrite: false
        }
      }
      if (state.uiCurrentOperand === '0') {
        return {
          ...state,
          currentOperand: `${payload.digit}`,
          uiCurrentOperand: `${payload.digit}`,
          uiCurrentOperandOverwrite: false
        }
      }

      if (state.uiCurrentOperandOverwrite) {
        return {
          ...state,
          currentOperand: `${payload.digit}`,
          uiCurrentOperand: `${payload.digit}`,
          uiCurrentOperandOverwrite: false
        }
      }

      return {
        ...state,
        currentOperand: `${state.currentOperand || ''}${payload.digit}`,
        uiCurrentOperand: `${state.uiCurrentOperand || ''}${payload.digit}`,
        uiCurrentOperandOverwrite: false
      }
    case ACTIONS.CLEAR:
      if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
        return { currentOperand: '', previousOperand: '', operation: '', memory: true, uiCurrentOperand: '0' }
      }
      return { currentOperand: '', previousOperand: '', operation: '', memory: false, uiCurrentOperand: '0' }
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand === '' && state.previousOperand === '') return state

      if (state.currentOperand === '') {
        return {
          ...state,
          operation: payload.operation,
          uiCurrentOperandOverwrite: true
        }
      }

      if (state.previousOperand === '') {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: '',
          uiCurrentOperandOverwrite: true
        }
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: '',
        uiCurrentOperandOverwrite: true
      }
    case ACTIONS.EVALUATE:
      if (state.operation === '' || state.currentOperand === '' || state.previousOperand === '') {
        return state
      }

      return {
        ...state,
        currentOperand: evaluate(state),
        uiCurrentOperand: evaluate(state),
        overwrite: true,
        previousOperand: '',
        operation: '',
      }
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: '',
          uiCurrentOperand: '0'
        }
      }
      if (state.currentOperand === '') return state
      if (state.currentOperand.length === 1) {
        return {
          ...state,
          currentOperand: '',
          uiCurrentOperand: '0'
        }
      }
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
        uiCurrentOperand: state.currentOperand.slice(0, -1)
      }
    case ACTIONS.RND:
      const randomNumber = Math.floor(Math.random() * 10000).toString()
      return {
        ...state,
        currentOperand: randomNumber,
        uiCurrentOperand: randomNumber
      }
    case ACTIONS.MPLUS:
      if (state.currentOperand === '') return state
      let savedNumberPlus
      if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
        savedNumberPlus = parseFloat(localStorage.getItem(LOCAL_STORAGE_KEY))
      } else {
        savedNumberPlus = 0
      }
      if (savedNumberPlus === (parseFloat(state.currentOperand) - (parseFloat(state.currentOperand) * 2))) {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
        return {
          ...state,
          memory: false
        }
      }
      let newNumberPlus = parseFloat(state.currentOperand) + savedNumberPlus
      localStorage.setItem(LOCAL_STORAGE_KEY, newNumberPlus)
      return {
        ...state,
        memory: true
      }
    case ACTIONS.MMINUS:
      if (state.currentOperand === '') return state
      let savedNumberMinus
      if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
        savedNumberMinus = parseFloat(localStorage.getItem(LOCAL_STORAGE_KEY))
      } else {
        savedNumberMinus = 0
      }
      if (savedNumberMinus === parseFloat(state.currentOperand)) {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
        return {
          ...state,
          memory: false
        }
      }
      let newNumberMinus = savedNumberMinus - parseFloat(state.currentOperand)
      localStorage.setItem(LOCAL_STORAGE_KEY, newNumberMinus)
      return {
        ...state,
        memory: true
      }
    case ACTIONS.MRECALL:
      const savedNumberRecall = parseFloat(localStorage.getItem(LOCAL_STORAGE_KEY)).toString()
      if (!isNaN(savedNumberRecall)) {
        return {
          ...state,
          memory: true,
          currentOperand: savedNumberRecall,
          uiCurrentOperand: savedNumberRecall
        }
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      return {
        ...state,
        memory: false,
        currentOperand: '',
        uiCurrentOperand: '0'
      }
    case ACTIONS.SETMEMORYTHERE:
      return {
        ...state,
        memory: true
      }
    case ACTIONS.MCLEAR:
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      return {
        ...state,
        memory: false
      }
    case ACTIONS.TURN_ON_CALC:
      return {
        ...state,
        uiCurrentOperand: '0'
      }
    default:
      return state
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) return ''

  let computation = ''
  switch (operation) {
    case '+':
      computation = prev + current
      break
    case '-':
      computation = prev - current
      break
    case '*':
      computation = prev * current
      break
    case '÷':
      if (currentOperand === '0') {
        computation = 'Err'
        break
      } else {
        computation = prev / current
        break
      }
    case '^':
      computation = Math.pow(prev, current)
      break
    default:
      return { currentOperand, previousOperand, operation }
  }

  return computation.toString()
}

function App() {
  const [{ currentOperand, previousOperand, operation, memory, uiCurrentOperand }, dispatch] = useReducer(reducer, { currentOperand: '', previousOperand: '', operation: '', memory: false, uiCurrentOperand: '' })
  const [off, setOff] = useState(true)

  useEffect(() => {
    if (localStorage.getItem(LOCAL_STORAGE_KEY)) {
      dispatch({ type: ACTIONS.SETMEMORYTHERE })
    }
  }, [])

  const customTheme = createTheme({
    typography: {
      'fontFamily': `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
      'fontSize': 18,
      'fontWeightLight': 300,
      'fontWeightRegular': 400,
      'fontWeightMedium': 500
    },
    palette: {
      primary: {
        main: '#3367D5'
      }
    }
  })

  const contextValues = {
    dispatch,
    off
  }

  return (
    <>
      <GlobalContext.Provider value={contextValues}>
        <ThemeProvider theme={customTheme}>
          <div className='header p-2' style={{ fontFamily: `'Roboto Slab', serif` }}>Simple Calc is an opensource calculator. Get source code from - <a href='https://github.com/princeroydeveloper/simple-calc' style={{ color: '#ffffff' }} target='_blank' rel='noopener noreferrer'>Github.com/PrinceRoyDeveloper/Simple-Calc</a></div>
          <Container maxWidth='xs' className='my-5'>
            <Card variant='elevation' className='p-4'>
              <CardContent>
                <Typography variant='h6' component='div' sx={{ textAlign: 'right', fontSize: 16, color: previousOperand && operation ? '#000000' : 'transparent', cursor: 'default' }}>{previousOperand && operation ? `${previousOperand} ${operation}` : '0'}</Typography>
                <TextField
                  variant='standard'
                  fullWidth
                  focused
                  value={uiCurrentOperand}
                  inputProps={{
                    readOnly: true,
                    disabled: false,
                    style: {
                      textAlign: 'right',
                      fontWeight: '600',
                      fontSize: '30px',
                      letterSpacing: 5,
                      fontFamily: `'Roboto Slab', serif`,
                      cursor: 'default'
                    }
                  }}
                  disabled={off}
                />
                <Grid container mt={1} spacing={2}>
                  <Grid item xs={3}>
                    <Button variant={off ? 'contained' : 'outlined'} sx={{ width: '100%', fontWeight: '600' }} onClick={() => {
                      if (off) {
                        dispatch({ type: ACTIONS.TURN_ON_CALC })
                        return setOff(false)
                      }
                      return dispatch({ type: ACTIONS.CLEAR })
                    }}>AC</Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button variant='outlined' sx={{ width: '100%', fontWeight: '600' }} onClick={() => dispatch({ type: ACTIONS.MPLUS })} disabled={off}>M+</Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button variant='outlined' sx={{ width: '100%', fontWeight: '600' }} onClick={() => dispatch({ type: ACTIONS.MMINUS })} disabled={off}>M-</Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button variant='outlined' sx={{ width: '100%', fontWeight: '600' }} onClick={() => dispatch({ type: ACTIONS.MRECALL })} disabled={off}>MR</Button>
                  </Grid>
                </Grid>
                <Grid container mt={1} spacing={2}>
                  <Grid item xs={3}>
                    <Button variant='outlined' sx={{ width: '100%', fontWeight: '600' }} onClick={() => dispatch({ type: ACTIONS.RND })} disabled={off}>RND</Button>
                  </Grid>
                  <OperationButton operation='^' />
                  <OperationButton operation='÷' />
                  <OperationButton operation='*' />
                </Grid>
                <Grid container mt={1} spacing={2}>
                  <DigitButton digit='1' />
                  <DigitButton digit='2' />
                  <DigitButton digit='3' />
                  <OperationButton operation='+' />
                </Grid>
                <Grid container mt={1} spacing={2}>
                  <DigitButton digit='4' />
                  <DigitButton digit='5' />
                  <DigitButton digit='6' />
                  <OperationButton operation='-' />
                </Grid>
                <Grid container mt={1} spacing={2}>
                  <DigitButton digit='7' />
                  <DigitButton digit='8' />
                  <DigitButton digit='9' />
                  <Grid item xs={3}>
                    <Button variant='outlined' sx={{ fontWeight: '600' }} onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })} disabled={off}>DEL</Button>
                  </Grid>
                </Grid>
                <Grid container mt={1} spacing={2}>
                  <DigitButton digit='.' />
                  <DigitButton digit='0' />
                  <DigitButton digit='00' />
                  <Grid item xs={2.5}>
                    <Button variant='contained' color='secondary' sx={{ width: '100%', fontWeight: '600' }} onClick={() => dispatch({ type: ACTIONS.EVALUATE })} disabled={off}>=</Button>
                  </Grid>
                </Grid>
                {!off && 
                  <>
                    {memory === true ?
                      <Button onClick={() => dispatch({ type: ACTIONS.MCLEAR })} className='mt-3 float-end' color='secondary' variant='text' size='small' style={{ fontSize: '12px', textTransform: 'capitalize' }}>Clear Memory</Button>
                      :
                      <Button className='mt-3 float-end' color='secondary' variant='text' size='small' style={{ fontSize: '12px', textTransform: 'capitalize' }} disabled>No Memory</Button>
                    }
                  </>
                }
                {off && 
                  <Button className='mt-3 float-end' color='secondary' variant='text' size='small' style={{ fontSize: '12px', textTransform: 'capitalize' }} disabled>Turn on calc to load memory</Button>
                }
              </CardContent>
            </Card>
          </Container>
        </ThemeProvider>
      </GlobalContext.Provider>
    </>
  )
}

export default App