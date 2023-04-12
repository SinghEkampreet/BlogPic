import React, { useReducer, useEffect } from "react";

import { validate } from "../../util/validators";

import "./Input.css";

const ACTIONS = {
  CHANGE: "CHANGE",
  TOUCH: "TOUCH",
};

const inputReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.CHANGE:
      return {
        ...state,
        value: action.val,
        isValid: validate(action.val, action.validators),
      };
    case ACTIONS.TOUCH:
      return {
        ...state,
        isTouched: true,
      };
    default:
      return state;
  }
};

const Input = ({
  id,
  type,
  placeholder,
  rows,
  label,
  element,
  errorText,
  validators,
  onInput,
  initialValue,
  initialIsValid,
}) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    value: initialValue || "",
    isValid: initialIsValid || false,
    isTouched: false,
  });

  const { value, isValid } = inputState;
  useEffect(() => {
    onInput(id, value, isValid);
  }, [onInput, id, value, isValid]);

  const changeHandler = (event) => {
    dispatch({
      type: ACTIONS.CHANGE,
      val: event.target.value,
      validators: validators,
    });
  };

  const touchHandler = () => {
    dispatch({
      type: ACTIONS.TOUCH,
    });
  };

  const elementTag =
    element === "input" ? (
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        onChange={changeHandler}
        onBlur={touchHandler} //Gives user a chance to enter value before we show error
        value={inputState.value}
      />
    ) : (
      <textarea
        id={id}
        rows={rows || 3}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    );

  return (
    <div
      className={`form-control ${
        !inputState.isValid && inputState.isTouched && "form-control--invalid"
      }`}
    >
      <label htmlFor={id}>{label}</label>
      {elementTag}
      {!inputState.isValid && inputState.isTouched && <p>{errorText}</p>}
    </div>
  );
};

export default Input;
