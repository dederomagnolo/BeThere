import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from "react-router-dom";

const PageContainer = (WrappedComponent) => {
    const auth = useSelector((state) => state.user.token);
    console.log(WrappedComponent);
    
    const Component = () => {
      return auth ? <WrappedComponent /> : <Redirect to={"/login"} />;
    }
    
    return Component;
  }

  export default PageContainer;