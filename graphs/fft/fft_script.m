%Name:          FFT on accelleration measurements
%Author:        Benjamin Komen
%Date:          March 26, 2016
%Last modified: March 28, 2016
%Description:   Read text file and applies fft and writes result

clear all;
clc;

% read data into array using third-party script
file_name	= 'full';
file_ext	= '.txt';
file_path	= '../experiment-data/trip_4_alt/';
input_path	= strcat(file_path, file_name, file_ext);
data_array	= txt2mat(input_path);

time_vec	= data_array(:,1);					% time points [s]
acc_vec		= data_array(:,2);					% acceleration data points [m/s2]
Fs			= 64;								% Sampling frequency [Hz = 1/s]
dt			= 1/Fs;								% Sampling period [s]

time_eq		= min(time_vec):dt:max(time_vec);	% vector of equally spaced time steps
vq			= interp1(time_vec,acc_vec,time_eq,'spline'); % interpolate it to get regular time steps
L  			= length(vq);						% length of vector [-]

acc_fft		= fft(acc_vec);						% compute fft [m/s2]

P2       = abs(acc_fft/L);						% two-sided spectrum [m/s2]
P1       = P2(1:L/2+1);							% one-sided spectrum [m/s2]
P1(2:end-1) = 2*P1(2:end-1);					% ?

f        = Fs*(0:(L/2))/L;						% frequency vector [Hz]
T        = table([f.'],[P1]);					% define output matrix

% write results to file
output_path = strcat(file_path, 'fft/', file_name, file_ext); %output file name
writetable(T,output_path);                      % write to file

%plot(f,P1)
%title('Single-Sided Amplitude Spectrum of acceleration')
%xlabel('f (Hz)')
%ylabel('|P1(f)|')