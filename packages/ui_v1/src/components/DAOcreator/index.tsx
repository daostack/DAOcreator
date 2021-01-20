import * as React from "react";
import {
  withStyles,
  Theme,
  WithStyles,
  createStyles,
  Stepper,
  Step,
  StepLabel,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Fab,
  Grid
} from "@material-ui/core";
import {
  DAOForm,
  DAOConfigForm,
  MembersForm,
  SchemesForm,
  toDAOMigrationParams,
  fromDAOMigrationParams,
  toJSON,
  fromJSON,
  setWeb3Provider,
  ProviderOrGetter
} from "@daostack/daocreator-lib";
import ArrowBack from "@material-ui/icons/ArrowBackIos";
import ArrowForward from "@material-ui/icons/ArrowForwardIos";
import SupportIcon from "@material-ui/icons/ContactSupport";
import NamingStep from "./NamingStep";
import MembersStep from "./MembersStep";
import SchemesStep from "./SchemesStep";
import ReviewStep from "./ReviewStep";
import DeployStep from "./DeployStep";

// eslint-disable-next-line
interface Props extends WithStyles<typeof styles> {
  setWeb3Provider?: ProviderOrGetter;
}

interface State {
  step: number;
  isMigrating: boolean;
  recoverPreviewOpen: boolean;
}

interface Step {
  title: string;
  form?: DAOForm | DAOConfigForm | MembersForm | SchemesForm;
  Component: any;
  props?: {
    [name: string]: any;
  };
}

// Local Storage Key + Values
const DAO_CREATOR_STATE = "DAO_CREATOR_SETUP";
interface DAO_CREATOR_STATE {
  step: number;
  form: string;
}

class DAOcreator extends React.Component<Props, State> {
  form = new DAOForm();
  recoveredForm = new DAOForm();

  constructor(props: Props) {
    super(props);
    this.state = {
      step: 0,
      isMigrating: false,
      recoverPreviewOpen: false
    };
  }

  componentDidMount() {
    // Allow users of the component to bypass
    // the default behaviour of getting the web3
    // provider from the window instance
    if (this.props.setWeb3Provider) {
      setWeb3Provider(this.props.setWeb3Provider);
    }

    // Preview a saved DAO if one is found
    this.previewLocalStorage();

    // Save progress if the window is closed
    window.addEventListener("beforeunload", this.saveLocalStorage);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.saveLocalStorage);
  }

  saveLocalStorage = () => {
    const daoState = this.form.toState();

    // Check to see if the current form state hasn't been edited,
    // and if so early out so we don't save an empty state
    const nullForm = new DAOForm();
    if (JSON.stringify(daoState) === JSON.stringify(nullForm.toState())) {
      return;
    }

    const daoParams = toDAOMigrationParams(daoState);
    const json = toJSON(daoParams);
    const daoCreatorState: DAO_CREATOR_STATE = {
      step: this.state.step,
      form: json
    };

    localStorage.setItem(DAO_CREATOR_STATE, JSON.stringify(daoCreatorState));
  };

  resetLocalStorage = () => {
    localStorage.removeItem(DAO_CREATOR_STATE);

    this.setState({
      ...this.state,
      step: 0,
      recoverPreviewOpen: false
    });
  };

  loadLocalStorage = () => {
    const daoCreatorState = localStorage.getItem(DAO_CREATOR_STATE);

    if (!daoCreatorState) {
      return;
    }

    const { step, form } = JSON.parse(daoCreatorState) as DAO_CREATOR_STATE;
    const daoParams = fromJSON(form);
    const daoState = fromDAOMigrationParams(daoParams);
    this.form.fromState(daoState);

    this.setState({
      ...this.state,
      step,
      recoverPreviewOpen: false
    });
  };

  previewLocalStorage = () => {
    const daoCreatorState = localStorage.getItem(DAO_CREATOR_STATE);

    if (!daoCreatorState) {
      return;
    }

    const { form } = JSON.parse(daoCreatorState) as DAO_CREATOR_STATE;
    const daoParams = fromJSON(form);
    const daoState = fromDAOMigrationParams(daoParams);
    this.recoveredForm.fromState(daoState);

    this.setState({
      ...this.state,
      recoverPreviewOpen: true
    });
  };

  onClose = () => {
    this.setState({
      ...this.state,
      recoverPreviewOpen: false
    });
  };

  render() {
    const steps: Step[] = [
      {
        title: "Name",
        form: this.form.$.config,
        Component: NamingStep,
        props: {
          daoForm: this.form,
          toReviewStep: () => {
            this.setState({
              ...this.state,
              step: 3
            });
          }
        }
      },
      {
        title: "Schemes",
        form: this.form.$.schemes,
        Component: SchemesStep
      },
      {
        title: "Members",
        form: this.form.$.members,
        Component: MembersStep,
        props: {
          getDAOTokenSymbol: () => this.form.$.config.$.tokenSymbol.value
        }
      },
      {
        title: "Review",
        form: this.form,
        Component: ReviewStep,
        props: {
          setStep: (step: number) => {
            this.setState({
              ...this.state,
              step
            });
          }
        }
      },
      {
        title: "Deploy",
        form: this.form,
        Component: DeployStep,
        props: {
          dao: this.form.toState(),
          onStart: () => {
            this.setState({
              ...this.state,
              isMigrating: true
            });
          },
          onStop: () => {
            this.setState({
              ...this.state,
              isMigrating: false
            });
          },
          onComplete: () => {
            this.setState({
              ...this.state,
              isMigrating: false
            });
          }
        }
      }
    ];
    const { classes } = this.props;
    const { step, recoverPreviewOpen, isMigrating } = this.state;
    const isLastStep = step === steps.length - 1;
    const { form, Component, props } = steps[step];

    const previousStep = async () => {
      this.setState({
        ...this.state,
        step: this.state.step - 1
      });
    };

    const nextStep = async () => {
      if (form) {
        const res = await form.validate();
        const { step } = this.state;

        if (!res.hasError) {
          this.setState({
            step: step + 1
          });
        } else {
          if (form.error) {
            this.setState({
              step
            });
          } else {
            this.setState({
              step
            });
          }
        }
      } else {
        this.setState({
          step: step + 1
        });
      }
    };

    const PreviewDialog = () => (
      <Dialog open={recoverPreviewOpen} fullWidth={true} maxWidth="md">
        <DialogTitle id="simple-dialog-title">
          In Progress DAO Detected
        </DialogTitle>
        <DialogContent>
          <ReviewStep form={this.recoveredForm} disableHeader />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={this.loadLocalStorage}
            size={"small"}
            color={"primary"}
            variant={"contained"}
          >
            Resume
          </Button>
          <Button
            onClick={this.resetLocalStorage}
            size={"small"}
            color={"primary"}
            variant={"contained"}
          >
            Start Over
          </Button>
        </DialogActions>
      </Dialog>
    );

    return (
      <>
        <div className={classes.root}>
          <Card>
            <Stepper
              className={classes.stepper}
              activeStep={step}
              alternativeLabel
            >
              {steps.map(thisStep => (
                <Step key={thisStep.title}>
                  <StepLabel>{thisStep.title}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Card>
          <div className={classes.content}>
            <Component form={form} {...props} />
          </div>
          <Grid container justify="space-between">
            <Fab
              variant="extended"
              color="primary"
              disabled={step === 0 || isMigrating}
              onClick={previousStep}
              className={classes.fab}
              size="large"
            >
              <ArrowBack />
              Back
            </Fab>
            <Fab
              variant="round"
              color="primary"
              className={classes.fab}
              size="small"
              onClick={() =>
                window.open("https://daostack.typeform.com/to/IaeXKv")
              }
            >
              <SupportIcon />
            </Fab>
            {!isLastStep ? (
              <Fab
                variant="extended"
                color="primary"
                onClick={nextStep}
                className={classes.fab}
                size="large"
              >
                Next
                <ArrowForward className={classes.extendedIcon} />
              </Fab>
            ) : (
              <div style={{ width: "94px" }} />
            )}
          </Grid>
        </div>
        <PreviewDialog />
      </>
    );
  }
}

// STYLE
const styles = (theme: Theme) =>
  createStyles({
    root: {
      boxSizing: "unset",
      minWidth: "450px",
      maxWidth: "1000px",
      justifySelf: "center",
      padding: 30,
      pointerEvents: "none",
      margin: "auto"
    },
    stepper: {
      padding: "18px",
      pointerEvents: "all"
    },
    content: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      pointerEvents: "all"
    },
    fab: {
      pointerEvents: "all"
    },
    fabsContainer: {
      zIndex: 10
    },
    button: {
      marginRight: theme.spacing(1),
      backgroundColor: "rgba(167, 167, 167, 0.77)!important", //TODO: find out why desabled buttons disapper, then fix it and remove this
      pointerEvents: "all"
    },
    extendedIcon: {
      marginRight: theme.spacing(-0.8),
      marginLeft: theme.spacing(0.9)
    }
  });

export default withStyles(styles)(DAOcreator);
