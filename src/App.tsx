import React, { useState } from 'react';
import './App.css';
import MonacoEditor, { EditorConstructionOptions } from 'react-monaco-editor';
import { JSONSchema6 } from 'json-schema';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
import FormStepPaginator from './components/FormStepPaginator/FormStepPaginator';
import DownloadFormDefinitionButton from './components/DownloadFormDefinitionButton/DownloadFormDefinitionButton';
import { UiSchema } from 'react-jsonschema-form';
import { MuiForm } from 'rjsf-material-ui';
import Paper from '@material-ui/core/Paper';
import { makeStyles, Grid, Container, Toolbar, Typography, CircularProgress, Box, Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

const formJSONSchemes: JSONSchema6[] = [{
  "title": "A registration form",
  "description": "A simple form example.",
  "type": "object",
  "required": [
    "firstName",
    "lastName"
  ],
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First name",
      "default": "Chuck"
    },
    "lastName": {
      "type": "string",
      "title": "Last name"
    }
  }
}];

const formUIScheme: UiSchema = {
  "firstName": {
    "ui:autofocus": true,
    "ui:emptyValue": ""
  }
};

const defaultJSONScheme: JSONSchema6 = {
  "title": "Default Form",
  "description": "This is a form.",
  "type": "object",
  "required": [
    "Hello"
  ],
  "properties": {
    "firstName": {
      "type": "string",
      "title": "Hello",
      "default": "World"
    }
  }
};

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing(2),
    color: theme.palette.text.secondary,
    marginBottom: 20
  },
  title: {
    flexGrow: 1
  },
  invisible: {
    position: "absolute",
    opacity: 0
  },
  visible: {
    opacity: 1
  },
  buttonSpaceRight: {
    marginRight: 20
  }
}));

function App(): JSX.Element {
  const [JSONSchemes, setJSONSchemes] = useState<JSONSchema6[]>(formJSONSchemes);
  const [activeJSONScheme, setActiveJSONScheme] = useState<JSONSchema6>(formJSONSchemes[0]);
  const [showJSONError, setShowJSONError] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [monacoEditorInstance, setMonacoEditorInstance] = useState<monacoEditor.editor.IStandaloneCodeEditor>();
  const [monacoInstance, setMonacoInstance] = useState<any>(); // TODO: type
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const classes = useStyles();

  const MINIMUM_LOAD_TIME_DELAY = 500;

  let jsonError = null;
  const jsonErrorMsg = "Error: invalid JSON input";

  const formatEditor = (editor: monacoEditor.editor.IStandaloneCodeEditor | undefined) => {
    setTimeout(() => editor?.getAction('editor.action.formatDocument').run(), 300);
  };

  const editorDidMount = (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: any): void => {
    editor.focus();

    // create a new editing environment within the current editor context
    let model = monaco.editor.createModel(JSON.stringify(JSONSchemes[0]), "json");

    // switch to the new editor
    editor.setModel(model);

    formatEditor(editor);

    // save the given instances of Monaco and the Editor instance
    setMonacoEditorInstance(editor);
    setMonacoInstance(monaco);

    setTimeout(() => setIsLoading(false), MINIMUM_LOAD_TIME_DELAY);
  }

  const onEditorValueChanged = (rawNewValue: string) => {

    try {
      let newValue: any = rawNewValue.trim();

      if (newValue[0] !== "{" || newValue === "") {
        newValue = {};
      }

      let newJSON: JSONSchema6 = JSON.parse(newValue);

      // update the current active json scheme
      setActiveJSONScheme(newJSON);

      // update the correct json scheme data
      JSONSchemes[currentStep] = newJSON;

      setShowJSONError(false);

    } catch (exc) {
      // invalid JSON
      setShowJSONError(true);
    }
  };

  const onStepChange = (i: number) => {

    // check whether this step exists
    if (JSONSchemes.length < i) {
      return;
    }

    setCurrentStep(i);

    let editorModels: monacoEditor.editor.ITextModel[] = monacoInstance.editor.getModels();
    let model: monacoEditor.editor.ITextModel = editorModels[i];

    if (model) {
      // switch to the correct editor
      monacoEditorInstance?.setModel(model);
      setActiveJSONScheme(JSONSchemes[i]);
    }
  };

  const onAddNewStep = () => {
    let newJSONSchemes = [...JSONSchemes, defaultJSONScheme];

    setJSONSchemes(newJSONSchemes);

    // create a new editing environment within the current editor context
    let model = monacoInstance?.editor.createModel(JSON.stringify(defaultJSONScheme), "json");

    // switch to the new editor
    monacoEditorInstance?.setModel(model);

    // format the document again
    formatEditor(monacoEditorInstance);
  };

  const onReset = () => {
    setJSONSchemes(formJSONSchemes);
    setActiveJSONScheme(formJSONSchemes[0]);
  };

  const options: EditorConstructionOptions = {
    selectOnLineNumbers: true,
    formatOnPaste: true,
    codeLens: true
  };

  if (showJSONError) {
    jsonError = <Alert severity="error">
      {jsonErrorMsg}
    </Alert>;
  }

  return (
    <div className={classes.root}>

      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          Form definitions EDIT / PREVIEW environment ~prototype
        </Typography>
      </Toolbar>

      <Container maxWidth="lg" className={isLoading ? classes.invisible : classes.visible}>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} className={classes.paper}>
              <MonacoEditor
                width="100%"
                height="475px"
                language="json"
                theme="vs-dark"
                options={options}
                editorDidMount={editorDidMount}
                onChange={onEditorValueChanged}
              />

              {jsonError}

            </Paper>
            <Paper elevation={2} className={classes.paper}>
              <Button variant="contained" color="secondary" onClick={onReset} className={classes.buttonSpaceRight}>Reset</Button>
              <DownloadFormDefinitionButton jsonSchemes={JSONSchemes} disabled={showJSONError} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} className={classes.paper}>

              {/* TODO: use Forms Platform JsonForm component here */}
              <MuiForm
                schema={activeJSONScheme}
                uiSchema={formUIScheme}
                onError={(type: string) => console.error(type)}
              >
                <Button variant="contained" color="primary" type="submit">
                  Submit
                </Button>
              </MuiForm>

            </Paper>
            <Paper elevation={2} className={classes.paper}>
              <FormStepPaginator
                jsonSchemes={JSONSchemes}
                onAddNewStep={onAddNewStep}
                onStepChange={onStepChange}
              />
            </Paper>
          </Grid>
        </Grid>

      </Container>

      {isLoading && (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      )}

    </div>
  );
};

export default App;