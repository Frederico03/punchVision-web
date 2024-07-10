import React, { useRef, useState, useEffect } from 'react'
import {
    FaPlay,
    FaPause,
    FaStop,
    FaExpand,
    FaCompress,
    FaVolumeUp,
    FaVolumeMute,
} from 'react-icons/fa'

const VideoView = ({ src, thumbnail }) => {

    const videoRef = useRef(null);
    const intervalRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [useNativeControls, setUseNativeControls] = useState(
        window.innerWidth < 767,
    );

    useEffect(() => {
        const handleResize = () => {
            setUseNativeControls(window.innerWidth < 767);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup Listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const updateProgess = () => {
        if (videoRef.current) {
            const value =
                (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(value)
        }
    };

    const startProgressLoop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        intervalRef.current = setInterval(() => {
            updateProgess();
        }, 1000);
    }
    const stopProgressLoop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        intervalRef.current = setInterval(() => {
            updateProgess();
        }, 1000);
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
                setIsPlaying(true);
                startProgressLoop();
            } else {
                videoRef.current.pause();
                setIsPlaying(false);
                stopProgressLoop();

            };
        }
    }

    const handleSeek = (event) => {
        const seekTo = (event.target.value / 100) * videoRef.current.duration;
        videoRef.current.currentTime = seekTo;
        setProgress(event.target.value);
    }

    const toggleMute = () => {
        const currentVolume = videoRef.current.volume;
        if (currentVolume > 0) {
            videoRef.current.volume = 0;
            setVolume(0);
            setIsMuted(true);
        } else {
            videoRef.current.volume = 1;
            setVolume(1);
            setIsMuted(false);
        }
    }

    const handleVolumeChange = (event) => {
        const newVolume = event.target.value;
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    }

    const stopVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }

    const toggleFullScreen = () => {
        if (!isFullScreen) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            } else if (videoRef.current.mozRequestFullScreen) {
                /*Firefox */
                videoRef.current.mozRequestFullScreen();
            } else if (videoRef.current.webkitRequestFullscreen) {
                /* Chrome, Safari & Opera */
                videoRef.current.webkitRequestFullscreen();
            } else if (videoRef.current.msRequestFullscreen) {
                /* IE/Edge */
                videoRef.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                /* Firefox */
                document.mozCancelFullscreen();
            } else if (document.webkitExitFullscreen) {
                /* Chrome, Safari and Opera */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                /* IE/Edge */
                document.msExitFullscreen();
            }
        }
        setIsFullScreen(!isFullScreen);
    };

    //.Listen.for. fullscreen. change . events . (for. exiting.fullscreen.with .ESC. key)
    document.addEventListener('fullscreenchange', () => {
        setIsFullScreen(!!document.fullscreenELement);
    });
    // .This . effect .cleans . up . the . event . Listener . when . the . component . unmounts
    useEffect(() => {
        const handleFullScreenChange = () =>
            setIsFullScreen(!!document.fullscreenELement);
        document.addEventListener('fullscreenchange', handleFullScreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);

    const renderCustomControls = () => {
        return (
            <>
                <button onClick={togglePlayPause}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button onClick={stopVideo}>
                    <FaStop />
                </button>
                <input
                    type='range'
                    min='0'
                    max='100'
                    value={progress}
                    onChange={handleSeek}
                />
                <button onClick={toggleMute}>
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button >
                <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.05'
                    value={volume}
                    onChange={handleVolumeChange}
                />
                <button onClick={toggleFullScreen}>
                    {isFullScreen ? <FaCompress /> : <FaExpand />}
                </button>
            </>
        );
    };

    useEffect(() => {
        //.Set .up. an .event . Listener for.when .the. video .ends
        const video = videoRef.current;

        const handleVideoEnd = () => {
            setIsPlaying(false);
            setProgress(0);
            stopProgressLoop();
        }

        if (video) {
            video.addEventListener('ended', handleVideoEnd);
        }

        //Clean up event Listener
        return () => {
            if (video) {
                video.removeEventListener('ended', handleVideoEnd);
            }
            stopProgressLoop();
        };
    }, []);

    return (
        <>
            <video
                className='video-player'
                ref={videoRef}
                src={src}
                onClick={togglePlayPause}
                onPlay={startProgressLoop}
                onPause={stopProgressLoop}
                controls={useNativeControls} // Use native controls based on viewport width
            />
            {!useNativeControls && renderCustomControls()}
        </>
    )
}

export default VideoView