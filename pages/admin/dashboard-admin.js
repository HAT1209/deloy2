import React, { useState, useEffect, useMemo } from "react";
// import firebase
import { db } from "src/firebase";
import {
  ref,
  orderByChild,
  equalTo,
  query,
  onValue,
  limitToLast,
} from "firebase/database";

// components
import { Header, Input, Line, Button } from "public/shared";
import EventButton from "public/shared/button/EventButton";
import { LEFT_COLOR, RIGHT_COLOR } from "public/util/colors";
// import Input from "public/shared/Input";
// import Line from "public/shared/Line";
// import Button from "public/shared/Button";

//import gif
import nyancat from "public/img/nyancat.gif";
import { useUserPackageHook } from "public/redux/hooks";
import router from "next/router";

export default function Dashboard() {
  const [arrStatus, setArrStatus] = useState([]);
  const [arrID, setArrID] = useState([]);
  // const [currentId, setcurentId] = useState([]);
  const currentUser = useUserPackageHook();
  // create query
  const queStatus = query(ref(db, "event"), orderByChild("status"), equalTo(2));
  const queID = query(
    ref(db, "event"),
    orderByChild("createBy"),
    limitToLast(4),
    equalTo(String(currentUser.userId))
  );
  const checkAuth = () => {
    router.push("/auth/login");
  };
  // get(child(ref(db), `event`))
  // .then((snapshot) => {
  //   const res = snapshot.val() ?? [];
  //   const values = Object.values(res);
  //   setArr(values);
  // })
  // .catch((error) => {
  //   alert(error.message);
  //   console.error(error);
  // });

  // useEffect(() => {
  //   onValue(child(ref(db), "event/"), (snapshot) => {
  //     const record = snapshot.val() ?? [];
  //     const values = Object.values(record);
  //     values.forEach((value) => {
  //       if (value.status === 2) {
  //         setQueryStatus((prev) => [...prev, value]);
  //         console.log(value);
  //       }
  //     });
  //     console.log(queryStatus);
  //   });
  // }, []);

  useEffect(() => {
    onValue(queStatus, (snapshot) => {
      setArrStatus([]);
      const data = snapshot.val();
      const values = Object.values(data);
      if (data != null) {
        values.forEach((value) => {
          if (value.delFlag === false) setArrStatus((prev) => [...prev, value]);
          // if (value.delFlag === false) setArrStatus(values)
        });
      }
    });
  }, [2]);

  useEffect(() => {
    onValue(queID, (snapshot) => {
      setArrID([]);
      const data = snapshot.val();
      const values = Object.values(data);
        if (data != null) {
          values.forEach((value) => {
          if (value.delFlag === false )
          setArrID((prev) => [...prev, value]);
          });
      }
     });
  }, [String(currentUser.userId)]);

  const renderHeader = useMemo(() => {
    return <Header />;
  }, []);

  const renderWelcome = useMemo(() => {
    return (
      <div className="flex flex-col pb-4 pt-2">
        <div className="flex flex-col">
          <div className="flex flex-col flex-1">
            <p className="font-bold text-sm text-[#656565] mt-2">
              {"Chào mừng đến với AIT Lucky App,"}
            </p>
          </div>

          <div className="flex justify-between items-end w-full">
            <p className="text-sm text-[#656565] mb-2">
              {"hãy bắt đầu chơi các sự kiện ngay nào!"}
            </p>
            <img
              src={nyancat}
              className="w-1/5 min-h-min "
              alt="must be a nyancat gif"
            ></img>
          </div>
        </div>
        <div className="w-full mb-2">
          <Line marginY={false} />
        </div>
      </div>
    );
  }, []);
  const renderJoinEvent = useMemo(() => {
    return (
      <Input content={"Tham gia sự kiện"}>
        <div className="flex flex-col pb-4 pt-2">
          <p className=" f text-sm text-[#656565] my-2">
            {"Tham gia vào các sự kiện được tổ chức bằng mã pin."}
          </p>
          <a href="/">
            <Button
              margin={"my-0"}
              content={"CHƠI VỚI MÃ PIN!"}
              primaryColor={LEFT_COLOR}
              secondaryColor={RIGHT_COLOR}
            />
          </a>
        </div>
      </Input>
    );
  }, []);
  const renderShowCurrentEvent = useMemo(() => {
    return (
      <Input content={"Các sự kiện đang diễn ra"} isTextGradient={true}>
        <div className="flex flex-col py-4">
          <div className="w-full flex flex-col gap-y-[7px] overflow-auto max-h-[188px] scrollbar-hide">
            {arrStatus.length === 0 ? (
              <div className="w-full flex items-center text-center justify-center text-sm text-[#000000]">
                {" "}
                {"Không có dữ liệu"}
              </div>
            ) : (
              arrStatus.map((item, index) => (
                <div key={index} className="flex flex-col">
                  <EventButton
                    className="bg-[#40BEE5]"
                    title={item.title}
                    userJoined={item.userJoined}
                    status={item.status}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </Input>
    );
  }, [arrStatus]);
  const renderCreateEvent = useMemo(() => {
    return (
      <Input content={"Tạo sự kiện"} isTextGradient={true}>
        <div className="">
          <p className="text-sm text-[#656565] pt-5">
            {
              "Tạo một sự kiện quay thưởng mới, bạn có thể thiết lập các giải thưởng, mỗi giải thưởng gồm tên, khái quát, hình ảnh giải thưởng, số lượng giải."
            }
          </p>
          <a href="/admin/event/event-register">
            <Button
              content={"TẠO SỰ KIỆN NGAY"}
              primaryColor={LEFT_COLOR}
              secondaryColor={RIGHT_COLOR}
            />
          </a>
        </div>
      </Input>
    );
  }, []);

  const renderShowCreateEvent = useMemo(() => {
    return (
      <Input content={"Danh sách sự kiện"} isTextGradient={true}>
        <p className=" text-sm text-[#656565] mt-5 mb-2">
          {"Hiển thị các sự kiện của tôi đã tạo"}
        </p>
        <div className="flex flex-col gap-y-[7px]">
          {arrID.length === 0 ? (
            <div className="w-full flex items-center text-center justify-center text-sm text-[#000000] ">
              {" "}
              {"Không có dữ liệu"}
            </div>
          ) : (
            arrID.map((item, index) => (
              <div key={index} className="flex flex-col">
                <EventButton title={item.title} id={item.eventId} />
              </div>
            ))
          )}
          <a href="event-list">
            <Button
              content={"Tất cả sự kiện"}
              primaryColor={LEFT_COLOR}
              secondaryColor={RIGHT_COLOR}
            />
          </a>
        </div>
      </Input>
    );
  }, [arrID]);

  return (
    <>
      {currentUser.userId == null ? (
        checkAuth()
      ) : (
        <div>
          {renderHeader}
          <section className="h-full max-w-xl w-4/5 mx-auto flex flex-col justify-center items-center pt-2">
            {/* {welcome to AIT App} */}
            {renderWelcome}
            {/* participate in event */}
            {renderJoinEvent}
            {/* create a event */}
            {renderShowCurrentEvent}
            {/*  */}
            {renderCreateEvent}
            {/* show events */}
            {renderShowCreateEvent}
          </section>
        </div>
      )}
    </>
  );
}
