import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import fetch from "node-fetch";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { CardActions, CardContent, FormGroup } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  main: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  root: {
    width: "600",
  },
  alertRoot: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

/**
 *  NOTES: multiple response functions have been written
 */

function App() {
  const classes = useStyles();
  const { control, register, handleSubmit, reset } = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {},
  });

  const [data, setData] = useState(undefined);
  const [alert, setAlert] = useState(false);
  const [error, setError] = useState(undefined);
  const [alertResult, setAlertResult] = useState("");
  const [cards, setCards] = useState([]);

  // Function for form
  const onSubmit = async (url) => {
    fetch("/clarity", {
      // fetch("http://127.0.0.1:4000/clarity", {
      method: "post",
      body: JSON.stringify(url),
      headers: { "Content-Type": "application/json" },
    }).then((res) => {
      if (res.ok) {
        res.json().then((json) => setData(json.analysis));
      } else {
        res.json().then((json) => setError(json));
      }
    });
  };

  useEffect(() => {
    if (data) {
      setAlert(false);
      setCards(
        data
          .filter((article) => article.related)
          .map((article) => (
            <Card className={classes.root}>
              <CardContent>
                <Typography variant="h5" component="h2">
                  {article.title}
                </Typography>
                <Typography className={classes.pos} color="textSecondary">
                  {article.author}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" href={article.url}>
                  {article.publication}
                </Button>
              </CardActions>
            </Card>
          ))
      );
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      setData(undefined);
      setCards([]);
      setAlert(true);
      setAlertResult(error.message);
    }
  }, [error]);

  return (
    <div className="App">
      <Container component="App" maxWidth="xs">
        <CssBaseline />
        <div className={classes.main}>
          <Typography component="h1" variant="h5">
            Clarity
          </Typography>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className={classes.form}
            noValidate
          >
            <Controller
              as={
                <TextField
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  label="Enter a URL..."
                  required
                  autoFocus
                />
              }
              required
              control={control}
              id="input"
              name="url"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Submit
            </Button>
          </form>
          {alert ? (
            <div className={classes.alertRoot}>
              <Alert severity="error">{alertResult}</Alert>
            </div>
          ) : (
            <div></div>
          )}
          {cards}
        </div>
      </Container>
    </div>
  );
}

export default App;
