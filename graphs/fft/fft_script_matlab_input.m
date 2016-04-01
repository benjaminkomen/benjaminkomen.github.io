%Name:          FFT on accelleration measurements
%Author:        Benjamin Komen
%Date:          March 26, 2016
%Last modified: April 1, 2016
%Description:   Read text file and applies fft and writes result

clear all;
clc;

% read data into array using third-party script
file_name	= '3';
file_ext	= '.txt';
file_path	= '../matlab-data/vel_100_nv_1_ne_250/';
input_path	= strcat(file_path, file_name, file_ext);
[data_array,ffn,nh,SR,hl]	= txt2mat(input_path);

head_lines  = strsplit(hl,'\n');
timestep1   = strsplit(head_lines{1},':');
dt          = str2num(timestep1{2});            % read timestep from header lines [s]

acc_vec		= data_array(:,1);					% acceleration data points [m/s2]
Fs			= 1/dt;								% Sampling frequency [Hz = 1/s]

L  			= length(acc_vec);					% length of vector [-]
%max_time    = (L-1)*timestep;                   % max time value [s]
%time_vec	= 0:timestep:max_time;              % vector of equally spaced time steps

acc_fft		= fft(acc_vec);						% compute fft [m/s2]

P2       = abs(acc_fft/L);						% two-sided spectrum [m/s2]
P1       = P2(1:L/2+1);							% one-sided spectrum [m/s2]
P1(2:end-1) = 2*P1(2:end-1);					% ?

f        = Fs*(0:(L/2))/L;						% frequency vector [Hz]
T        = table([f.'],[P1]);					% define output matrix

% write results to file
output_path = strcat(file_path, 'fft/', file_name, file_ext); %output file name
writetable(T,output_path);                      % write to file

plot(f,P1)
title('Single-Sided Amplitude Spectrum of acceleration')
xlabel('f (Hz)')
ylabel('|P1(f)|')