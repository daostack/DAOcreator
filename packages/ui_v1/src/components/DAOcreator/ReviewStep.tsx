import * as React from "react";
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Fab
} from "@material-ui/core";
import WarningIcon from "@material-ui/icons/WarningTwoTone";
import EditIcon from "@material-ui/icons/Settings";
import { DAOForm, SchemeType } from "@daostack/daocreator-lib";
import SchemesEditor from "../common/dao/SchemesEditor";
import DAOConfigEditor from "../common/dao/DAOConfigEditor";
import MembersEditor from "../common/dao/MembersEditor";
import MembersAnalytics from "../common/dao/MembersAnalytics";

interface Props {
  form: DAOForm;
  disableHeader?: boolean;
  // TODO: don't use a number here, use an enum instead. This will break easily.
  setStep?: (step: number) => void;
}

export default class ReviewStep extends React.Component<Props> {
  render() {
    const { form, disableHeader, setStep } = this.props;
    const { config, schemes, members } = form.$;
    const getDAOTokenSymbol = () => config.$.tokenSymbol.value;
    const missingSchemeReg =
      schemes.$.findIndex(
        scheme => scheme.type === SchemeType.SchemeRegistrar
      ) === -1;

    const modifyStep = (step: number) => (
      <Fab
        color={"primary"}
        onClick={() => {
          if (setStep) setStep(step);
        }}
        style={{
          height: "20px",
          width: "20px",
          minHeight: "20px",
          marginRight: "5px",
          marginTop: "5px"
        }}
      >
        <EditIcon fontSize={"inherit"} />
      </Fab>
    );

    const titleText = (title: string, step: number) => (
      <Grid container direction={"row"}>
        {setStep ? modifyStep(step) : ""}
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      </Grid>
    );

    return (
      <Card>
        <CardContent>
          {!disableHeader ? (
            <>
              <Typography variant="h4">Everything look good?</Typography>
              <Divider />
            </>
          ) : (
            <></>
          )}
          <Grid container spacing={3} direction={"column"}>
            <Grid item>
              {titleText("Names", 0)}
              <Grid container justify={"center"}>
                <DAOConfigEditor form={config} editable={false} />
              </Grid>
            </Grid>
            <Grid item>
              {titleText("Schemes", 1)}
              <SchemesEditor form={schemes} editable={false} />
              {missingSchemeReg ? (
                <Grid container direction={"row"}>
                  <WarningIcon color={"error"} />
                  <Typography color={"error"}>
                    Warning: Your DAO is missing a SchemeRegistrar, and will not
                    be able to modify itself once deployed. We highly recommend
                    adding this to your DAO.
                  </Typography>
                </Grid>
              ) : (
                <></>
              )}
            </Grid>
            <Grid item>
              {titleText("Members", 2)}
              <Grid container direction={"row"} justify={"center"}>
                <MembersAnalytics data={members.toState()} />
              </Grid>
              <MembersEditor
                form={members}
                editable={false}
                getDAOTokenSymbol={getDAOTokenSymbol}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
