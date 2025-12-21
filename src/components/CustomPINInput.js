import { Box, HStack, PinInput, Button } from "@chakra-ui/react";
import { useState, useRef } from "react";

const pinInputStyles = {
  borderColor: "rgba(108, 117, 125, 1)",
  boxShadow: "none",
  _focus: { borderColor: "black", boxShadow: "0 0 0 1px black" },
  _hover: {
    borderColor: "rgba(108, 117, 125, 1)",
    boxShadow: "0 0 0 1px rgba(108, 117, 125, 1)",
  },
};

const CustomPINInput = ({ verify, isBusy, setIsBusy, reset }) => {
  const [verified, setVerified] = useState(true);

  const [pin, setPin] = useState(new Array(6).fill(""));
  const inputRef = useRef(null);
  const firstRef = useRef(null);

  const clear = () => {
    setPin(new Array(6).fill(""));
    setVerified(false);
    reset();
    firstRef.current?.focus(); // optional: focus first box again
  };

  return (
    <HStack justify="center" spacing={["2px", "20px"]}>
      <PinInput.Root
        size="xl"
        required
        otp
        //defaultValue={pin}
        value={pin}
        onValueChange={(e) => {
          console.log(e);
          setPin(e.value);
        }}
        invalid={!verified}
        disabled={isBusy}
        //autoFocus
        onValueComplete={async (e) => {
          const value = e.value.join("");
          console.log("onComplete", value);
          if (isBusy) return;
          setIsBusy(true);
          try {
            const res = await verify(value);
            console.log("Verify Result:", res);
            if (res) {
              setVerified(true);
              // setState?.({ nextDisabled: false });
            } else {
              setVerified(false);
            }
          } catch (err) {
            setVerified(false);
          } finally {
            setIsBusy(false);
          }
        }}
      >
        <PinInput.HiddenInput ref={inputRef} />

        <PinInput.Control>
          {[...Array(6)].map((_, idx) => {
            /* const pinProps = {
              sx: pinInputStyles,
              height: "50px",
              width: ["47px", "50px"],
              fontSize: ["24px", "30px"],
              _placeholder: { color: "#cdcdcd" },
            }; */

            if (idx === 0) {
              return (
                <PinInput.Input
                  ref={firstRef}
                  key={`pin_input_${idx}`}
                  index={idx}
                  //{...pinProps}
                />
              );
            } else {
              return (
                <PinInput.Input
                  key={`pin_input_${idx}`}
                  index={idx}
                  //  {...pinProps}
                />
              );
            }
          })}
        </PinInput.Control>
      </PinInput.Root>
      <Button onClick={clear} variant="ghost" size="sm">
        Clear
      </Button>
    </HStack>
  );
};

export default CustomPINInput;
