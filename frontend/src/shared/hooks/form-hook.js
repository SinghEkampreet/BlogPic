import { useCallback, useReducer } from "react";

const ACTIONS = {
  INPUT_CHANGE: "INPUT_CHANGE",
  SET_DATA: "SET_DATA",
};

const formReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.INPUT_CHANGE:
      let formIsValid = true;
      for (const inputId in state.inputs) {
        if (!state.inputs[inputId]) {
          continue;
        }
        if (inputId === action.inputId) {
          formIsValid = formIsValid && action.isValid;
        } else {
          formIsValid = formIsValid && state.inputs[inputId].isValid;
        }
      }
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.inputId]: { value: action.value, isValid: action.isValid },
        },
        isValid: formIsValid,
      };

    case ACTIONS.SET_DATA:
      return {
        inputs: action.inputs,
        isValid: action.formIsValid,
      };

    default:
      return state;
  }
};

export const useForm = (initialInput, initialIsValid) => {
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInput,
    isValid: initialIsValid,
  });

  // useCallback used to mitigate infinite loop
  //  this fn used in Input component's useEffect hook
  //  this will prevent this fun from re-rendering when this component re-renders
  const inputHandler = useCallback((id, value, isValid) => {
    dispatch({
      type: ACTIONS.INPUT_CHANGE,
      value: value,
      inputId: id,
      isValid: isValid,
    });
  }, []);

  const setFormData = useCallback((inputData, formValidity) => {
    dispatch({
      type: ACTIONS.SET_DATA,
      inputs: inputData,
      formIsValid: formValidity,
    });
  }, []);

  return [formState, inputHandler, setFormData];
};
