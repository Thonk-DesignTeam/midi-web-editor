"use client";
// Define a minimal interface for SerialPort
interface MinimalSerialPort {
  open: (options: { baudRate: number }) => Promise<void>;
  readable: ReadableStream<Uint8Array>;
}


import { ThemeProvider } from "@/components/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"




import { useState, useRef, useEffect } from "react";

export default function Home() {
  // Removed unused 'port'
  const [connected, setConnected] = useState(false);
  const [consoleLines, setConsoleLines] = useState<string[]>([]);
  const monitorRef = useRef<HTMLDivElement>(null);

  const [noteRange, setNoteRange] = useState<number[]>([0, 127]);
  const [transposeAmmount, setTransposeAmmount] = useState<number>(0);
  const [glideAmmount, setGlideAmmount] = useState<number>(0);
  const [bendAmmount, setBendAmmount] = useState<number>(2);

  // Auto-scroll when new messages come in
  useEffect(() => {
    if (monitorRef.current) {
      monitorRef.current.scrollTop = monitorRef.current.scrollHeight;
    }
  }, [consoleLines]);

  // Connect to serial device
  const connectSerial = async () => {
    try {
      // @ts-expect-error: navigator.serial is not yet in TypeScript DOM types
      const serialPort = await navigator.serial.requestPort();
      await (serialPort as MinimalSerialPort).open({ baudRate: 115200 });
      setConnected(true);
      setConsoleLines(lines => [...lines, "Connected"]);
      readSerial(serialPort as MinimalSerialPort);
    } catch (err) {
      setConsoleLines(lines => [...lines, "Connection failed: " + err]);
    }
  };

  // Read from serial device
  const readSerial = async (serialPort: MinimalSerialPort) => {
    const decoder = new TextDecoder();
    const reader = serialPort.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          setConsoleLines(lines => [...lines, "← " + decoder.decode(value)]);
        }
      }
    } catch (err) {
      setConsoleLines(lines => [...lines, "Read error: " + err]);
    } finally {
      reader.releaseLock();
    }
  };

  // // Send command to serial device
  // const sendCommand = async () => {
  //   if (!port || !inputRef.current) return;
  //   const command = inputRef.current.value;
  //   const writer = port.writable.getWriter();
  //   await writer.write(new TextEncoder().encode(command + "\n"));
  //   writer.releaseLock();
  //   setConsoleLines(lines => [...lines, "→ " + command]);
  //   inputRef.current.value = "";
  // };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="grid grid-rows-[20px_1fr_20px] min-h-screen max-w-3xl mx-auto p-8 pb-20 gap-10 font-[family-name:var(--font-geist-mono)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <header className="text-3xl text-center mx-auto">Thonk Synth t10 Midi-CV Editor</header>
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Welcome to the Thonk Synth t10 Midi-CV Settings Editor. This tool is still under development..
                </p>
                <p>
                  To get started, click the Connect button below.
                </p>

              </CardContent>
            </Card>


            <Card className="col-span-2">
              <CardContent>
                <p className="flex justify-center mb-4">
                  <Button onClick={connectSerial} disabled={connected} className="w-full"> Connect </Button>
                </p>
                <Card>
                  <CardContent>
                    <div
                      ref={monitorRef}
                      style={{
                        height: 200,
                        overflowY: "auto",
                        fontFamily: "monospace"
                      }}
                    >
                      {consoleLines.map((line, i) => <div key={i}>{line}</div>)}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Note Output</CardTitle>
              </CardHeader>
              <CardContent>

                <p className="mb-2">
                  <HoverCard>
                    <HoverCardTrigger>
                      Note Range: {noteRange[0]} to {noteRange[1]}
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Select the MIDI note range to output. Notes outside this range will be ignored.
                    </HoverCardContent>
                  </HoverCard>
                </p>
                <p className="mb-8">
                  <Slider min={0} max={127} step={1} minStepsBetweenThumbs={1} value={noteRange} onValueChange={setNoteRange} />
                </p>

                <p className="mb-2">
                  <HoverCard>
                    <HoverCardTrigger>
                      Transpose: {transposeAmmount}
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Transpose the note output in semitones.
                    </HoverCardContent>
                  </HoverCard>
                </p>
                <p className="mb-8">
                  <Slider min={-12} max={12} step={1} value={[transposeAmmount]} onValueChange={([val]) => setTransposeAmmount(val)} />
                </p>

                <p className="mb-2">
                  <HoverCard>
                    <HoverCardTrigger>
                      Glide: {glideAmmount} ms
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Apply a glide between notes.
                    </HoverCardContent>
                  </HoverCard>
                </p>
                <p className="mb-8">
                  <Slider min={0} max={500} step={1} value={[glideAmmount]} onValueChange={([val]) => setGlideAmmount(val)} />
                </p>

                <p className="mb-2">
                  <HoverCard>
                    <HoverCardTrigger>
                      Pitch Bend Range: +/- {bendAmmount}
                    </HoverCardTrigger>
                    <HoverCardContent>
                      Set the pitch bend range.
                    </HoverCardContent>
                  </HoverCard>
                </p>
                <p className="mb-8">
                  <Slider min={0} max={24} step={1} value={[bendAmmount]} onValueChange={([val]) => setBendAmmount(val)} />
                </p>



              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Gate Output</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  The note output is a 12 bit value that is sent to the t10. The value is
                  calculated from the note and octave.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Vel Output</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  The note output is a 12 bit value that is sent to the t10. The value is
                  calculated from the note and octave.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>CC Output</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  The note output is a 12 bit value that is sent to the t10. The value is
                  calculated from the note and octave.
                </p>
              </CardContent>
            </Card>            <Card>
              <CardHeader>
                <CardTitle>Clock Output</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  The note output is a 12 bit value that is sent to the t10. The value is
                  calculated from the note and octave.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reset Output</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  The note output is a 12 bit value that is sent to the t10. The value is
                  calculated from the note and octave.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
        <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
          <a href="https://www.thonk.co.uk">thonk.co.uk</a>
        </footer>
      </div>
    </ThemeProvider>
  );
}
