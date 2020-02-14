import React, { FC } from "react";

import { MembersForm, SchemesForm } from "@dorgtech/daocreator-lib";

import LineGraphic from "../LineGraphic";
import { simpleOptionsSwitcher } from "../../utils";
import { MDBIcon, MDBRow, MDBCol } from "mdbreact";

export const ConfigPreview: FC<{ daoName: string; daoSymbol: string }> = ({
  daoName,
  daoSymbol
}) => (
  <MDBRow
    style={{
      marginTop: "26px",
      marginRight: "auto",
      marginLeft: "1.5rem",
      whiteSpace: "nowrap"
    }}
  >
    <MDBCol>
      <span>
        Name: <strong>{daoName}</strong>
      </span>
    </MDBCol>
    <MDBCol>
      <span>
        Symbol: <strong>{daoSymbol}</strong>
      </span>
    </MDBCol>
  </MDBRow>
);

export const SchemesPreview: FC<{ form: SchemesForm }> = ({ form }) => {
  const simpleOptions = simpleOptionsSwitcher(form, true);
  const noDuplicateSimpleOptions = simpleOptions.slice(
    0,
    simpleOptions.length / 2
  );
  return (
    <div style={styles.schemePreview}>
      <p>
        <strong>Recommended</strong>
      </p>
      {noDuplicateSimpleOptions.map((option: any, index: number) => (
        <div key={index}>
          <p>
            <MDBIcon
              icon="check"
              className={option.checked ? "blue-text" : "grey-text"}
            />{" "}
            {option.text}
          </p>
        </div>
      ))}
    </div>
  );
};

export const MembersPreview: FC<{
  form: MembersForm;
  tokenSymbol: string;
}> = ({ form, tokenSymbol }) => {
  const reputationConfig = {
    showPercentage: false,
    height: "0.5rem",
    symbol: "REP",
    dataKey: "reputation",
    nameKey: "address"
  };
  const tokenConfig = {
    showPercentage: false,
    height: "0.5rem",
    symbol: tokenSymbol,
    dataKey: "tokens",
    nameKey: "address"
  };
  let totalReputationAmount = 0;
  let totalTokenAmount = 0;
  form.toState().map(({ reputation, tokens }: any) => {
    totalReputationAmount += reputation;
    totalTokenAmount += tokens;
    return null;
  });
  const numberOfMembers = form.$.length;
  return (
    <div style={styles.membersPreview}>
      <p>
        {numberOfMembers} Member{numberOfMembers > 1 && "s"}
      </p>
      <div style={{ width: "17.5em" }}>
        <p>Reputation Distribution</p>
        <LineGraphic
          data={form.toState() as any} // Working with this type is weird
          total={totalReputationAmount}
          config={reputationConfig}
          style={styles.lineGraphic}
        />
      </div>
      {totalTokenAmount > 0 && (
        <div style={{ paddingTop: "20px", width: "17.5em" }}>
          <p>{tokenSymbol} Token Distribution</p>
          <LineGraphic
            data={form.toState() as any} // Working with this type is weird
            total={totalTokenAmount}
            config={tokenConfig}
            style={styles.lineGraphic}
          />
        </div>
      )}
    </div>
  );
};

const styles = {
  lineGraphic: {
    padding: "unset"
  },
  schemePreview: {
    marginTop: 28
  },
  membersPreview: {
    marginTop: 28,
    paddingRight: "8rem"
  }
};
