import React, { useState, useEffect, useMemo } from "react";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
import { uniqueId } from "lodash";
import { filesize } from "filesize";
import { useDropzone } from 'react-dropzone'
import { baseStyle, focusedStyle, acceptStyle, rejectStyle } from "styles/MainView";
import VideoView from "./VideoView";
import "../assets/css/stylesVideo.css"
import VideoThumb from "../assets/media/punchvisionoficial.svg"
import MyVideo from "../assets/media/videoplayback.mp4"
import boxe from "../assets/media/boxe.jpeg"
// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    CardTitle,
    Row,
    Col,
    UncontrolledDropdown,
    DropdownToggle,
    Button
} from "reactstrap";

// core components
import PanelHeader from "components/PanelHeader/PanelHeader.js";

import {
} from "variables/charts.js";

function Dashboard() {

    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [dropzoneVisible, setDropzoneVisible] = useState(true);  // Novo estado para controlar a visibilidade do Dropzone
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject
    } = useDropzone({
        accept: {
            "video/mp4"
                : ['.mp4']
        },
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                handleUpload(acceptedFiles);
            }
        }
    });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isFocused,
        isDragAccept,
        isDragReject
    ]);

    const handleUpload = (video) => {
        const newUploadedVideo = video.map((video) => ({
            video,
            id: uniqueId(),
            name: video.name,
            size: video.size,
            readableSize: filesize(video.size),
            preview: URL.createObjectURL(video),
            url: URL.createObjectURL(video),
            uploaded: true,
        }));

        if (!localStorage.getItem("updatedVideo"))
            localStorage.setItem("updatedVideo", JSON.stringify(newUploadedVideo));
        else return;

        setUploadedVideo(newUploadedVideo);
    };

    const handleDelete = () => {
        if (uploadedVideo) {
            URL.revokeObjectURL(uploadedVideo.preview);
            setUploadedVideo(null);
            localStorage.removeItem("updatedVideo");
            setDropzoneVisible(true);
            setIsButtonDisabled(true);
        }
    }

    useEffect(() => {
        if (uploadedVideo) {
            setDropzoneVisible(false);
            setIsButtonDisabled(false);
            return () => {
                URL.revokeObjectURL(uploadedVideo.preview);
            };
        } else {
            setDropzoneVisible(true);
            setIsButtonDisabled(true);
        }
    }, [uploadedVideo]);

    useEffect(() => {
        const savedVideo = JSON.parse(localStorage.getItem("updatedVideo")) || [];
        setUploadedVideo(
            savedVideo.map((video) => ({
                ...video,
                readableSize: filesize(video.size),
                preview: video.url,
            }))
        );
    }, []);
    return (
        <>
            <PanelHeader
                size="lg"
                content={
                    <img src={boxe} className="panel-header-image" />
                }
            />
            <div className="content">
                <Row>
                    <Col xs={12} md={12}>
                        <Card className="card-chart">
                            <CardHeader>
                                <h5 className="card-category">Selecione um video mp4</h5>
                                <CardTitle tag="h4"></CardTitle>
                                <UncontrolledDropdown>
                                    <DropdownToggle
                                        className="btn-round btn-outline-default btn-icon"
                                        color="danger"
                                    >
                                        <i className="now-ui-icons ui-1_simple-remove" onClick={() => handleDelete()} />
                                    </DropdownToggle>
                                </UncontrolledDropdown>
                            </CardHeader>
                            <CardBody>
                                <Col>
                                    <div className="places-buttons">
                                        <Row>
                                            <Col xs={12} lg={4} className="ml-auto mr-auto">
                                                <Button
                                                    color="info"
                                                    block
                                                    disabled={isButtonDisabled}
                                                    onClick={() => notify("tl")}
                                                >
                                                    Analisar Vídeo
                                                </Button>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs={12} className="ml-auto mr-auto">
                                                {dropzoneVisible ? (
                                                    <div {...getRootProps({ style })}>
                                                        <input {...getInputProps()} />
                                                        <p>Arraste algum vídeo aqui, ou clique para selecionar .mp4</p>
                                                    </div>
                                                ) : (
                                                    <div className="video-wrapper">
                                                        <VideoView src={MyVideo} thumbnail={VideoThumb} />
                                                    </div>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </CardBody>
                            <CardFooter>
                                <div className="stats">

                                </div>
                            </CardFooter>
                        </Card>
                    </Col>
                </Row>
            </div >
        </>
    );
}

export default Dashboard;
