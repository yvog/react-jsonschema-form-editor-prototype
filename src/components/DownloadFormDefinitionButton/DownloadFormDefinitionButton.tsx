import React from 'react';
import './DownloadFormDefinitionButton.css';
import { JSONSchema6 } from 'json-schema';
import { Button } from '@material-ui/core';

type DownloadFormDefinitionButtonProps = {
    jsonSchemes: JSONSchema6[];
    disabled: boolean;
}

function DownloadFormDefinitionButton(props: DownloadFormDefinitionButtonProps): JSX.Element {
    const fileName: string = "formdefinition_";

    const downloadToJSONFile = () => {
        let a: HTMLAnchorElement = document.createElement("a");
        var file: Blob = new Blob([JSON.stringify(props.jsonSchemes)], { type: "application/json" });
        var utcDateTime = new Date().toJSON().replace(/\.|:/g, '_');

        a.href = URL.createObjectURL(file);
        a.download = fileName + utcDateTime;

        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <Button
            variant="contained"
            color="primary"
            onClick={downloadToJSONFile}
            disabled={props.disabled}
        >
            Download as JSON
        </Button>
    );
};

export default DownloadFormDefinitionButton;