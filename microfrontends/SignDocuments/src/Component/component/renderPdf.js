import React from "react";
import RSC from "react-scrollbars-custom";
import { Rnd } from "react-rnd";
import { themeColor } from "../../utils/ThemeColor/backColor";
import { Document, Page, pdfjs } from "react-pdf";
import BorderResize from "./borderResize";
import {
  addZIndex,
  handleImageResize,
  handleSignYourselfImageResize
} from "../../utils/Utils";
import EmailToast from "./emailToast";
import PlaceholderBorder from "./placeholderBorder";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function RenderPdf({
  pageNumber,
  pdfOriginalWidth,
  pdfNewWidth,
  drop,
  signerPos,
  successEmail,
  nodeRef,
  handleTabDrag,
  handleStop,
  isDragging,
  setIsSignPad,
  setIsStamp,
  handleDeleteSign,
  setSignKey,
  pdfDetails,
  xyPostion,
  pdfRef,
  pdfUrl,
  numPages,
  pageDetails,
  recipient,
  isAlreadySign,
  pdfRequest,
  setCurrentSigner,
  signerObjectId,
  signedSigners,
  setPdfLoadFail,
  placeholder,
  pdfLoadFail,
  setSignerPos,
  setXyPostion,
  index,
  containerWH,
  setIsResize,
  setZIndex,
  setIsPageCopy,
  setSignerObjId
}) {
  const isMobile = window.innerWidth < 767;
  const newWidth = containerWH.width;
  const scale = isMobile ? pdfOriginalWidth / newWidth : 1;
  //check isGuestSigner is present in local if yes than handle login flow header in mobile view
  const isGuestSigner = localStorage.getItem("isGuestSigner");

  // handle signature block width and height according to screen
  const posWidth = (pos) => {
    const defaultWidth = 150;
    const posWidth = pos.Width ? pos.Width : defaultWidth;
    let width;
    if (isMobile) {
      if (!pos.isMobile) {
        if (pos.IsResize) {
          width = posWidth ? posWidth : defaultWidth;
          return width;
        } else {
          width = (posWidth || defaultWidth) / scale;
          return width;
        }
      } else {
        width = posWidth ? posWidth : defaultWidth;
        return width;
      }
    } else {
      if (pos.isMobile) {
        if (pos.IsResize) {
          width = posWidth ? posWidth : defaultWidth;
          return width;
        } else {
          width = (posWidth || defaultWidth) * pos.scale;
          return width;
        }
      } else {
        width = posWidth ? posWidth : defaultWidth;
        return width;
      }
    }
  };
  const posHeight = (pos) => {
    let height;
    const posHeight = pos.Height;
    const defaultHeight = 60;
    if (isMobile) {
      if (!pos.isMobile) {
        if (pos.IsResize) {
          height = posHeight ? posHeight : defaultHeight;
          return height;
        } else {
          height = (posHeight || defaultHeight) / scale;
          return height;
        }
      } else {
        height = posHeight ? posHeight : defaultHeight;
        return height;
      }
    } else {
      if (pos.isMobile) {
        if (pos.IsResize) {
          height = posHeight ? posHeight : defaultHeight;
          return height;
        } else {
          height = (posHeight || defaultHeight) * pos.scale;
          return height;
        }
      } else {
        height = posHeight ? posHeight : defaultHeight;
        return height;
      }
    }
  };

  const xPos = (pos) => {
    const resizePos = pos.xPosition;
    //checking both condition mobile and desktop view
    if (isMobile) {
      //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
      if (!pos.isMobile) {
        return resizePos / scale;
      }
      //pos.isMobile true -- placeholder save from mobile view(small device)  handle position in mobile view(small screen) view divided by scale
      else {
        return resizePos * (pos.scale / scale);
      }
    } else {
      //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale

      if (pos.isMobile) {
        return pos.scale && resizePos * pos.scale;
      }
      //else placeholder save from desktop(bigscreen) and show in desktop(bigscreen)
      else {
        return resizePos;
      }
    }
  };
  const yPos = (pos) => {
    const resizePos = pos.yPosition;
    //checking both condition mobile and desktop view
    if (isMobile) {
      //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divided by scale
      if (!pos.isMobile) {
        return resizePos / scale;
      }
      //pos.isMobile true -- placeholder save from mobile view(small device)  handle position in mobile view(small screen) view divided by scale
      else {
        return resizePos * (pos.scale / scale);
      }
    } else {
      //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale

      if (pos.isMobile) {
        return pos.scale && resizePos * pos.scale;
      }
      //else placeholder save from desktop(bigscreen) and show in desktop(bigscreen)
      else {
        return resizePos;
      }
    }
  };
  //function for render placeholder block over pdf document
  const checkSignedSignes = (data) => {
    const checkSign = signedSigners.filter(
      (sign) => sign.objectId === data.signerObjId
    );
    if (data.signerObjId === signerObjectId) {
      setCurrentSigner(true);
    }

    return (
      checkSign.length === 0 &&
      data.placeHolder.map((placeData, key) => {
        return (
          <React.Fragment key={key}>
            {placeData.pageNumber === pageNumber &&
              placeData.pos.map((pos, index) => {
                return (
                  pos && (
                    <React.Fragment key={pos.key}>
                      <Rnd
                        disableDragging={true}
                        enableResizing={{
                          top: false,
                          right: false,
                          bottom: false,
                          left: false,
                          topRight: false,
                          bottomRight:
                            data.signerObjId === signerObjectId && true,
                          bottomLeft: false,
                          topLeft: false
                        }}
                        bounds="parent"
                        style={{
                          cursor:
                            data.signerObjId === signerObjectId
                              ? "pointer"
                              : "not-allowed",
                          background: data.blockColor,
                          borderColor: themeColor(),
                          borderStyle: "dashed",
                          borderWidth: "0.1px",
                          zIndex: "1"
                        }}
                        className="signYourselfBlock"
                        size={{
                          width: posWidth(pos),
                          height: posHeight(pos)
                        }}
                        onResize={(e, direction, ref, delta, position) => {
                          handleImageResize(
                            ref,
                            pos.key,
                            data.signerObjId,
                            position,
                            signerPos,
                            pageNumber,
                            setSignerPos,
                            pdfOriginalWidth,
                            containerWH,
                            true
                          );
                        }}
                        lockAspectRatio={
                          pos.Width ? pos.Width / pos.Height : 2.5
                        }
                        default={{
                          x: xPos(pos),
                          y: yPos(pos)
                        }}
                        onClick={() => {
                          if (data.signerObjId === signerObjectId) {
                            setIsSignPad(true);
                            setSignKey(pos.key);
                            setIsStamp(pos.isStamp);
                          }
                        }}
                      >
                        <div style={{ pointerEvents: "none" }}>
                          {data.signerObjId === signerObjectId && (
                            <BorderResize />
                          )}
                          {pos.SignUrl ? (
                            <img
                              alt="no img"
                              onClick={() => {
                                setIsSignPad(true);
                                setSignKey(pos.key);
                              }}
                              src={pos.SignUrl}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain"
                              }}
                            />
                          ) : (
                            pdfDetails[0].Signers.map((signerData, key) => {
                              return (
                                signerData.objectId === data.signerObjId && (
                                  <div
                                    key={key}
                                    style={{
                                      fontSize: "12px",
                                      color: "black",
                                      fontWeight: "600",

                                      marginTop: "0px"
                                    }}
                                  >
                                    {signerData.Name}
                                  </div>
                                )
                              );
                            })
                          )}
                        </div>
                      </Rnd>
                    </React.Fragment>
                  )
                );
              })}
          </React.Fragment>
        );
      })
    );
  };

  const BlockDesign = ({ pos, data }) => {
    return (
      <div>
        <i
          class="fa-regular fa-copy signCopy"
          onClick={(e) => {
            console.log("hello console");
            e.stopPropagation();
            setIsPageCopy(true);
            setSignKey(pos.key);
          }}
          style={{
            color: "#188ae2"
          }}
        ></i>
        <i
          class="fa-regular fa-circle-xmark signCloseBtn"
          onClick={(e) => {
            e.stopPropagation();
            if (data) {
              handleDeleteSign(pos.key, data.signerObjId);
            } else {
              handleDeleteSign(pos.key);
              setIsStamp(false);
            }
          }}
          style={{
            color: "#188ae2"
          }}
        ></i>

        {pos.SignUrl ? (
          <div style={{ pointerEvents: "none" }}>
            <img
              alt="signimg"
              src={pos.SignUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain"
              }}
            />
          </div>
        ) : (
          <div
            style={{
              fontSize: "12px",
              color: "black",
              justifyContent: "center"
            }}
          >
            {pos.isStamp ? "stamp" : "signature"}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isMobile && scale ? (
        <div
          style={{
            border: "0.1px solid #ebe8e8",
            marginTop: isGuestSigner && "30px"
          }}
          ref={drop}
          id="container"
        >
          <EmailToast isShow={successEmail} />
          {pdfLoadFail.status &&
            (recipient
              ? !pdfUrl &&
                !isAlreadySign.mssg &&
                xyPostion.length > 0 &&
                xyPostion.map((data, ind) => {
                  return (
                    <React.Fragment key={ind}>
                      {data.pageNumber === pageNumber &&
                        data.pos.map((pos) => {
                          return (
                            pos && (
                              <Rnd
                                data-tut="reactourSecond"
                                disableDragging={true}
                                enableResizing={{
                                  top: false,
                                  right: false,
                                  bottom: false,
                                  left: false,
                                  topRight: false,
                                  bottomRight: true,
                                  bottomLeft: false,
                                  topLeft: false
                                }}
                                key={pos.key}
                                bounds="parent"
                                style={{
                                  cursor: "all-scroll",
                                  borderColor: themeColor(),
                                  borderStyle: "dashed",
                                  borderWidth: "0.1px",
                                  zIndex: "1",
                                  background: data.blockColor
                                    ? data.blockColor
                                    : "#daebe0"
                                }}
                                className="signYourselfBlock"
                                onResize={(
                                  e,
                                  direction,
                                  ref,
                                  delta,
                                  position
                                ) => {
                                  handleSignYourselfImageResize(
                                    ref,
                                    pos.key,
                                    direction,
                                    position,
                                    xyPostion,
                                    index,
                                    setXyPostion,
                                    pdfOriginalWidth,
                                    containerWH
                                  );
                                }}
                                size={{
                                  width: posWidth(pos),
                                  height: posHeight(pos)
                                }}
                                lockAspectRatio={
                                  pos.Width ? pos.Width / pos.Height : 2.5
                                }
                                //if pos.isMobile false -- placeholder saved from desktop view then handle position in mobile view divide by scale
                                //else if pos.isMobile true -- placeholder saved from mobile or tablet view then handle position in desktop view divide by scale
                                default={{
                                  x: xPos(pos),
                                  y: yPos(pos)
                                }}
                                onClick={() => {
                                  setIsSignPad(true);
                                  setSignKey(pos.key);
                                  setIsStamp(false);
                                }}
                              >
                                <BorderResize />
                                {pos.SignUrl ? (
                                  <img
                                    alt="no img"
                                    onClick={() => {
                                      setIsSignPad(true);
                                      setSignKey(pos.key);
                                    }}
                                    src={pos.SignUrl}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain"
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      color: "black",

                                      justifyContent: "center",
                                      marginTop: "0px"
                                    }}
                                  >
                                    {pos.isStamp ? "stamp" : "signature"}
                                  </div>
                                )}
                              </Rnd>
                            )
                          );
                        })}
                    </React.Fragment>
                  );
                })
              : pdfRequest
                ? signerPos.map((data, key) => {
                    return (
                      <React.Fragment key={key}>
                        {checkSignedSignes(data)}
                      </React.Fragment>
                    );
                  })
                : placeholder
                  ? signerPos.map((data, ind) => {
                      return (
                        <React.Fragment key={ind}>
                          {data.placeHolder.map((placeData, index) => {
                            return (
                              <React.Fragment key={index}>
                                {placeData.pageNumber === pageNumber &&
                                  placeData.pos.map((pos) => {
                                    return (
                                      <Rnd
                                        enableResizing={{
                                          top: false,
                                          right: false,
                                          bottom: false,
                                          left: false,
                                          topRight: false,
                                          bottomRight: true,
                                          bottomLeft: false,
                                          topLeft: false
                                        }}
                                        key={pos.key}
                                        style={{
                                          cursor: "all-scroll",
                                          background: data.blockColor,
                                          borderColor: data.bac,
                                          zIndex: pos.zIndex
                                        }}
                                        className="signYourselfBlock"
                                        onDrag={() => handleTabDrag(pos.key)}
                                        size={{
                                          width: pos.Width ? pos.Width : 150,
                                          height: pos.Height ? pos.Height : 60
                                        }}
                                        lockAspectRatio={
                                          pos.Width
                                            ? pos.Width / pos.Height
                                            : 2.5
                                        }
                                        onDragStop={(event, dragElement) =>
                                          handleStop(
                                            event,
                                            dragElement,
                                            data.signerObjId,
                                            pos.key
                                          )
                                        }
                                        default={{
                                          x: pos.xPosition,
                                          y: pos.yPosition
                                        }}
                                        onResizeStart={() => {
                                          setIsResize(true);
                                        }}
                                        onResizeStop={() => {
                                          setIsResize && setIsResize(false);
                                        }}
                                        onResize={(
                                          e,
                                          direction,
                                          ref,
                                          delta,
                                          position
                                        ) => {
                                          handleImageResize(
                                            ref,
                                            pos.key,
                                            data.signerObjId,
                                            position,
                                            signerPos,
                                            pageNumber,
                                            setSignerPos,
                                            pdfOriginalWidth,
                                            containerWH,
                                            false
                                          );
                                        }}
                                      >
                                        <BorderResize right={-12} top={-11} />
                                        <PlaceholderBorder pos={pos} />

                                        <div
                                          onTouchEnd={() => {
                                            const dataNewPlace = addZIndex(
                                              signerPos,
                                              pos.key,
                                              setZIndex
                                            );
                                            setSignerPos((prevState) => {
                                              const newState = [...prevState];
                                              newState.splice(
                                                0,
                                                signerPos.length,
                                                ...dataNewPlace
                                              );
                                              return newState;
                                            });
                                          }}
                                        >
                                          <i
                                            class="fa-regular fa-copy signCopy"
                                            onTouchEnd={(e) => {
                                              e.stopPropagation();
                                              setIsPageCopy(true);
                                              setSignKey(pos.key);
                                              setSignerObjId(data.signerObjId);
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setIsPageCopy(true);
                                              setSignKey(pos.key);
                                            }}
                                            style={{
                                              color: "#188ae2"
                                            }}
                                          ></i>
                                          <i
                                            class="fa-regular fa-circle-xmark signCloseBtn"
                                            onTouchStart={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSign(
                                                pos.key,
                                                data.signerObjId
                                              );
                                            }}
                                            style={{
                                              color: "#188ae2"
                                            }}
                                          ></i>

                                          <div
                                            style={{
                                              fontSize: "12px",
                                              color: "black",
                                              fontWeight: "600",
                                              marginTop: "0px"
                                            }}
                                          >
                                            {pos.isStamp
                                              ? "stamp"
                                              : "signature"}
                                          </div>
                                        </div>
                                      </Rnd>
                                    );
                                  })}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  : xyPostion.map((data, ind) => {
                      return (
                        <React.Fragment key={ind}>
                          {data.pageNumber === pageNumber &&
                            data.pos.map((pos) => {
                              return (
                                pos && (
                                  <Rnd
                                    allowAnyClick
                                    enableResizing={{
                                      top: false,
                                      right: false,
                                      bottom: false,
                                      left: false,
                                      topRight: false,
                                      bottomRight: true,
                                      bottomLeft: false,
                                      topLeft: false
                                    }}
                                    lockAspectRatio={
                                      pos.Width ? pos.Width / pos.Height : 2.5
                                    }
                                    bounds="parent"
                                    ref={nodeRef}
                                    key={pos.key}
                                    className="signYourselfBlock"
                                    style={{
                                      border: "1px solid red",
                                      cursor: "all-scroll",
                                      zIndex: "1",
                                      background: "#daebe0"
                                    }}
                                    size={{
                                      width: pos.Width ? pos.Width : 150,
                                      height: pos.Height ? pos.Height : 60
                                    }}
                                    default={{
                                      x: pos.xPosition,
                                      y: pos.yPosition
                                    }}
                                    onDrag={() => handleTabDrag(pos.key)}
                                    onDragStop={handleStop}
                                    onResize={(
                                      e,
                                      direction,
                                      ref,
                                      delta,
                                      position
                                    ) => {
                                      handleSignYourselfImageResize(
                                        ref,
                                        pos.key,
                                        direction,
                                        position,
                                        xyPostion,
                                        index,
                                        setXyPostion,
                                        pdfOriginalWidth,
                                        containerWH
                                      );
                                    }}
                                    onTouchEnd={(e) => {
                                      console.log("go here");
                                      if (!isDragging && isMobile) {
                                        setTimeout(() => {
                                          e.stopPropagation();
                                          setIsSignPad(true);
                                          setSignKey(pos.key);
                                          setIsStamp(pos.isStamp);
                                        }, 500);
                                      }
                                    }}
                                  >
                                    <BorderResize right={-12} top={-11} />
                                    <PlaceholderBorder pos={pos} />
                                    <div
                                      onTouchEnd={(e) => {
                                        console.log("go here");
                                        if (!isDragging && isMobile) {
                                          setTimeout(() => {
                                            e.stopPropagation();
                                            setIsSignPad(true);
                                            setSignKey(pos.key);
                                            setIsStamp(pos.isStamp);
                                          }, 500);
                                        }
                                      }}
                                    >
                                      <i
                                        class="fa-regular fa-copy signCopy"
                                        onTouchEnd={(e) => {
                                          e.stopPropagation();
                                          setIsPageCopy(true);
                                          setSignKey(pos.key);
                                        }}
                                        style={{
                                          color: "#188ae2"
                                        }}
                                      ></i>
                                      <i
                                        class="fa-regular fa-circle-xmark signCloseBtn"
                                        onTouchEnd={(e) => {
                                          e.stopPropagation();
                                          if (data) {
                                            handleDeleteSign(
                                              pos.key,
                                              data.signerObjId
                                            );
                                          } else {
                                            handleDeleteSign(pos.key);
                                            setIsStamp(false);
                                          }
                                        }}
                                        style={{
                                          color: "#188ae2"
                                        }}
                                      ></i>

                                      {pos.SignUrl ? (
                                        <div style={{ pointerEvents: "none" }}>
                                          <img
                                            alt="signimg"
                                            src={pos.SignUrl}
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "contain"
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            color: "black",
                                            justifyContent: "center"
                                          }}
                                        >
                                          {pos.isStamp ? "stamp" : "signature"}
                                        </div>
                                      )}
                                    </div>
                                  </Rnd>
                                )
                              );
                            })}
                        </React.Fragment>
                      );
                    }))}

          {/* this component for render pdf document is in middle of the component */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Document
              onLoadError={(e) => {
                if (recipient) {
                  setPdfLoadFail(true);
                }
              }}
              onLoadSuccess={pageDetails}
              ref={pdfRef}
              file={
                pdfUrl
                  ? pdfUrl
                  : pdfDetails[0] && pdfDetails[0].SignedUrl
                    ? pdfDetails[0].SignedUrl
                    : pdfDetails[0].URL
              }
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={index}
                  pageNumber={pageNumber}
                  width={containerWH.width}
                  height={containerWH.height}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  onGetAnnotationsError={(error) => {
                    console.log("annotation error", error);
                  }}
                />
              ))}
            </Document>
          </div>
        </div>
      ) : (
        <RSC
          style={{
            position: "relative",
            boxShadow: "rgba(17, 12, 46, 0.15) 0px 48px 100px 0px",
            width:
              pdfOriginalWidth > pdfNewWidth ? pdfNewWidth : pdfOriginalWidth,
            height: window.innerHeight - 110 + "px"
          }}
          noScrollY={false}
          noScrollX={pdfNewWidth < pdfOriginalWidth ? false : true}
        >
          <div
            style={{
              border: "0.1px solid #ebe8e8",
              width: pdfOriginalWidth
            }}
            ref={drop}
            id="container"
          >
            <EmailToast isShow={successEmail} />
            {pdfLoadFail.status &&
              (recipient
                ? !pdfUrl &&
                  !isAlreadySign.mssg &&
                  xyPostion.length > 0 &&
                  xyPostion.map((data, ind) => {
                    return (
                      <React.Fragment key={ind}>
                        {data.pageNumber === pageNumber &&
                          data.pos.map((pos) => {
                            return (
                              pos && (
                                <Rnd
                                  data-tut="reactourSecond"
                                  disableDragging={true}
                                  enableResizing={{
                                    top: false,
                                    right: false,
                                    bottom: false,
                                    left: false,
                                    topRight: false,
                                    bottomRight: true,
                                    bottomLeft: false,
                                    topLeft: false
                                  }}
                                  onResize={(
                                    e,
                                    direction,
                                    ref,
                                    delta,
                                    position
                                  ) => {
                                    handleSignYourselfImageResize(
                                      ref,
                                      pos.key,
                                      direction,
                                      position,
                                      xyPostion,
                                      index,
                                      setXyPostion,
                                      pdfOriginalWidth,
                                      containerWH
                                    );
                                  }}
                                  key={pos.key}
                                  bounds="parent"
                                  style={{
                                    cursor: "all-scroll",
                                    borderColor: themeColor(),
                                    borderStyle: "dashed",
                                    borderWidth: "0.1px",
                                    zIndex: "1",
                                    background: data.blockColor
                                      ? data.blockColor
                                      : "#daebe0"
                                  }}
                                  className="signYourselfBlock"
                                  size={{
                                    width: posWidth(pos),
                                    height: posHeight(pos)
                                  }}
                                  lockAspectRatio={
                                    pos.Width ? pos.Width / pos.Height : 2.5
                                  }
                                  default={{
                                    x: xPos(pos),
                                    y: yPos(pos)
                                  }}
                                  onClick={() => {
                                    setIsSignPad(true);
                                    setSignKey(pos.key);
                                    setIsStamp(false);
                                  }}
                                >
                                  <div style={{ pointerEvents: "none" }}>
                                    <BorderResize />
                                    {pos.SignUrl ? (
                                      <img
                                        alt="no img"
                                        onClick={() => {
                                          setIsSignPad(true);
                                          setSignKey(pos.key);
                                        }}
                                        src={pos.SignUrl}
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "contain"
                                        }}
                                      />
                                    ) : (
                                      <div
                                        style={{
                                          fontSize: "12px",
                                          color: "black",
                                          fontWeight: "600",
                                          justifyContent: "center",
                                          marginTop: "0px"
                                        }}
                                      >
                                        {pos.isStamp ? "stamp" : "signature"}
                                      </div>
                                    )}
                                  </div>
                                </Rnd>
                              )
                            );
                          })}
                      </React.Fragment>
                    );
                  })
                : pdfRequest
                  ? signerPos.map((data, key) => {
                      return (
                        <React.Fragment key={key}>
                          {checkSignedSignes(data)}
                        </React.Fragment>
                      );
                    })
                  : placeholder
                    ? signerPos.map((data, ind) => {
                        return (
                          <React.Fragment key={ind}>
                            {data.placeHolder.map((placeData, index) => {
                              return (
                                <React.Fragment key={index}>
                                  {placeData.pageNumber === pageNumber &&
                                    placeData.pos.map((pos) => {
                                      return (
                                        <Rnd
                                          onClick={() => {
                                            const dataNewPlace = addZIndex(
                                              signerPos,
                                              pos.key,
                                              setZIndex
                                            );
                                            setSignerPos((prevState) => {
                                              const newState = [...prevState];
                                              newState.splice(
                                                0,
                                                signerPos.length,
                                                ...dataNewPlace
                                              );
                                              return newState;
                                            });
                                          }}
                                          key={pos.key}
                                          enableResizing={{
                                            top: false,
                                            right: false,
                                            bottom: false,
                                            left: false,
                                            topRight: false,
                                            bottomRight: true,
                                            bottomLeft: false,
                                            topLeft: false
                                          }}
                                          bounds="parent"
                                          style={{
                                            cursor: "all-scroll",
                                            background: data.blockColor,

                                            zIndex: pos.zIndex
                                          }}
                                          className="signYourselfBlock"
                                          onDrag={() => handleTabDrag(pos.key)}
                                          size={{
                                            width: pos.Width ? pos.Width : 150,
                                            height: pos.Height ? pos.Height : 60
                                          }}
                                          lockAspectRatio={
                                            pos.Width
                                              ? pos.Width / pos.Height
                                              : 2.5
                                          }
                                          onDragStop={(event, dragElement) =>
                                            handleStop(
                                              event,
                                              dragElement,
                                              data.signerObjId,
                                              pos.key
                                            )
                                          }
                                          default={{
                                            x: pos.xPosition,
                                            y: pos.yPosition
                                          }}
                                          onResizeStart={() => {
                                            setIsResize(true);
                                          }}
                                          onResizeStop={() => {
                                            setIsResize && setIsResize(false);
                                          }}
                                          onResize={(
                                            e,
                                            direction,
                                            ref,
                                            delta,
                                            position
                                          ) => {
                                            handleImageResize(
                                              ref,
                                              pos.key,
                                              data.signerObjId,
                                              position,
                                              signerPos,
                                              pageNumber,
                                              setSignerPos,
                                              pdfOriginalWidth,
                                              containerWH,
                                              false
                                            );
                                          }}
                                        >
                                          <BorderResize right={-12} top={-11} />
                                          <PlaceholderBorder pos={pos} />
                                          <div>
                                            <i
                                              class="fa-regular fa-copy signCopy"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setIsPageCopy(true);
                                                setSignKey(pos.key);
                                                setSignerObjId(
                                                  data.signerObjId
                                                );
                                              }}
                                              style={{
                                                color: "#188ae2"
                                              }}
                                            ></i>
                                            <i
                                              class="fa-regular fa-circle-xmark signCloseBtn"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSign(
                                                  pos.key,
                                                  data.signerObjId
                                                );
                                              }}
                                              style={{
                                                color: "#188ae2"
                                              }}
                                            ></i>

                                            <div
                                              style={{
                                                fontSize: "12px",
                                                color: "black",
                                                justifyContent: "center"
                                              }}
                                            >
                                              {pos.isStamp
                                                ? "stamp"
                                                : "signature"}
                                            </div>
                                          </div>
                                        </Rnd>
                                      );
                                    })}
                                </React.Fragment>
                              );
                            })}
                          </React.Fragment>
                        );
                      })
                    : xyPostion.map((data, ind) => {
                        return (
                          <React.Fragment key={ind}>
                            {data.pageNumber === pageNumber &&
                              data.pos.map((pos) => {
                                return (
                                  pos && (
                                    <Rnd
                                      ref={nodeRef}
                                      key={pos.key}
                                      lockAspectRatio={
                                        pos.Width ? pos.Width / pos.Height : 2.5
                                      }
                                      enableResizing={{
                                        top: false,
                                        right: false,
                                        bottom: false,
                                        left: false,
                                        topRight: false,
                                        bottomRight: true,
                                        bottomLeft: false,
                                        topLeft: false
                                      }}
                                      bounds="parent"
                                      className="signYourselfBlock"
                                      style={{
                                        border: "1px solid red",
                                        cursor: "all-scroll",
                                        zIndex: "1",
                                        background: "#daebe0"
                                      }}
                                      onDrag={() => handleTabDrag(pos.key)}
                                      size={{
                                        width: pos.Width ? pos.Width : 150,
                                        height: pos.Height ? pos.Height : 60
                                      }}
                                      onDragStop={handleStop}
                                      default={{
                                        x: pos.xPosition,
                                        y: pos.yPosition
                                      }}
                                      onResize={(
                                        e,
                                        direction,
                                        ref,
                                        delta,
                                        position
                                      ) => {
                                        handleSignYourselfImageResize(
                                          ref,
                                          pos.key,
                                          direction,
                                          position,
                                          xyPostion,
                                          index,
                                          setXyPostion,
                                          pdfOriginalWidth,
                                          containerWH
                                        );
                                      }}
                                      onClick={() => {
                                        if (!isDragging) {
                                          setIsSignPad(true);
                                          setSignKey(pos.key);
                                          setIsStamp(pos.isStamp);
                                        }
                                      }}
                                    >
                                      <BorderResize right={-12} top={-11} />
                                      <PlaceholderBorder pos={pos} />

                                      <BlockDesign pos={pos} />
                                    </Rnd>
                                  )
                                );
                              })}
                          </React.Fragment>
                        );
                      }))}

            {/* this component for render pdf document is in middle of the component */}
            <Document
              onLoadError={(e) => {
                if (recipient) {
                  const load = {
                    status: false,
                    type: "failed"
                  };
                  setPdfLoadFail(load);
                }
              }}
              onLoadSuccess={pageDetails}
              ref={pdfRef}
              file={
                pdfUrl
                  ? pdfUrl
                  : pdfDetails[0] && pdfDetails[0].SignedUrl
                    ? pdfDetails[0].SignedUrl
                    : pdfDetails[0].URL
              }
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={index}
                  pageNumber={pageNumber}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  onGetAnnotationsError={(error) => {
                    console.log("annotation error", error);
                  }}
                />
              ))}
            </Document>
          </div>
        </RSC>
      )}
    </>
  );
}

export default RenderPdf;
