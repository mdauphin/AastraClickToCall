REM Windows
mkdir build
xcopy /Y /S src build

pushd build
"C:\Program Files\7-Zip\7z.exe" a -tzip -r ..\AastraClickToCall-1.3.xpi .
popd