import React, { useRef } from "react";
import { createPortal } from "react-dom";
import { CSSTransition } from "react-transition-group";

import "./SideDrawer.css";

const SideDrawer = ({ children, show, onClick }) => {
  const nodeRef = useRef(null);

  // CSSTransition function takes special attributes which are given in the docs
  const content = (
    <CSSTransition
      in={show}
      timeout={200}
      classNames="slide-in-left"
      mountOnEnter
      unmountOnExit
      nodeRef={nodeRef}
    >
      <aside className="side-drawer" onClick={onClick}>
        {children}
      </aside>
    </CSSTransition>
  );

  return <>{createPortal(content, document.getElementById("drawer-hook"))}</>;
};

export default SideDrawer;
