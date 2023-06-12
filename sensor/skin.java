protected void parse(String dataIn) throws Exception {
    Integer batteryLevelInt;
    Integer voltageBiasInt;
    Integer voltageOutputInt;
    try {
        if (dataIn != null) {
            String begin = dataIn.substring(0, 2);
            if (!begin.equals("AA")) {
                throw new Exception((new StringBuilder()).append("String should start with 'AA', instead it was: ").append(begin).toString());
            }
            String tmpStr = dataIn.substring(2, 4);
            Integer size = Integer.decode((new StringBuilder()).append("0x").append(tmpStr).toString());
            tmpStr = dataIn.substring(6, 10);
            id = Integer.decode((new StringBuilder()).append("0x").append(tmpStr).toString());
            tmpStr = dataIn.substring(14, 16);
            serial = Integer.decode((new StringBuilder()).append("0x").append(tmpStr).toString());
            tmpStr = dataIn.substring(22, 24);
            batteryLevelInt = Integer.decode((new StringBuilder()).append("0x").append(tmpStr).toString());
            batteryLevel = batteryLevelInt.doubleValue() * 0.012464135808848989D + 0.0063781751018856239D + 0.20000000000000001D;
            batteryLevel = (batteryLevelInt.doubleValue() * 3D) / 255D;
            tmpStr = dataIn.substring(30, 34);
            voltageOutputInt = Integer.decode((new StringBuilder()).append("0x").append(tmpStr).toString());
            voltageOutput = (voltageOutputInt.doubleValue() * 3D) / 1023D;
            if (voltageOutputInt == voltageBiasInt) {
                conductanceMicroS = 0.0D;
            } else {
                conductanceMicroS = (voltageBias - voltageOutput) / (batteryLevel - voltageBias);
            }
            if (conductanceMicroS < 0.0D) {
                if (Math.abs(batteryLevel - voltageBias) < 0.0029296875D) {
                    conductanceMicroS = Math.abs(conductanceMicroS);
                } else if (Math.abs(voltageOutput - voltageBias) < 0.0050000000000000001D) {
                    conductanceMicroS = Math.abs(conductanceMicroS);
                } else {
                    conductanceMicroS = Math.abs(conductanceMicroS);
                }
            }
        }

        batteryLevel/=5;
        voltageBias/=5;
        voltageOutput/=5;
        conductanceMicroS/=3D;
    } catch (NumberFormatException ne) {
        throw new Exception((new StringBuilder()).append("Bad number format:\n").append(ne).toString());
    }
}