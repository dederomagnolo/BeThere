import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThreeBounce } from 'styled-spinkit';
import { useHistory } from "react-router-dom";
import { Container, Form, Button, Logo, InnerContainer } from './styles';
import logo from '../../assets/bethere_logo.png';
import callApi from '../../services/callApi';
import { Input } from '../../components/input';
import {setUserInfo, setToken} from '../../store/user/actions';
import {setGlobalLoading} from '../../store/global/actions';
import {getGlobalLoading} from '../../store/global/selectors';
import {getToken} from '../../store/user/selectors';

const Login = () => {
  const [inputs, setInputs] = useState({username: "", password: ""});
  const [hide, setHide] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  const loading = useSelector(getGlobalLoading);
  const token = useSelector(getToken);
 
  useEffect(() => {
    if(token !== "") {
      console.log(token);
      history.push('/');
    }
  }, []);

  async function handleSubmit(e) {
    const { username, password } = inputs;
    e.preventDefault();

    if(password.length < 10) {
      return alert("Username/Password incorrect"); 
    }

    if(username === "" || username === "") {
      return alert("Username or password fields are empty");
    }

    dispatch(setGlobalLoading(true));

    const payload = {
      username,
      password
    };
     
    const res = await callApi(
      "POST", 
      "/auth/authenticate",
      payload
    );

    if(res && res.token) {
      const token = res.token;
      const userInfo = res.user;
      dispatch(setUserInfo(userInfo));
      dispatch(setToken(token));
      dispatch(setGlobalLoading(false)); 
      history.push('/');
    } else {
      dispatch(setGlobalLoading(false)); 
      alert("Error! Try again later.");
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prevState => ({...prevState, [name]: value}));
  }

  return (
    hide ? <></> : <Container>
      <InnerContainer className="innerContainer">
        <Logo>
          <img src={logo} alt=""/>
          <p style={{textAlign: 'center', color: '#FFF'}}>Your garden smart</p>
        </Logo>
        
        <Form onSubmit={handleSubmit}>
          <Input
            placeholder="username"
            onChange={handleChange}
            value={inputs.username}
            name="username"
            type="username"
          />
          <Input
            style={{marginTop: "5px"}}
            placeholder="password"
            onChange={handleChange}
            value={inputs.password}
            name="password"
            type="password"
          />
          {loading 
            ? <ThreeBounce color="#FFF"/> 
            : (
                <Button 
                  type="submit" 
                  disabled={inputs.username === "" || inputs.password === ""}
                >
                  Entrar
                </Button>
              )}
        </Form>
      </InnerContainer>
    </Container>
  );
}

export default Login;