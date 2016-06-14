%Name:          FFT on ansys data
%Author:        Benjamin Komen
%Date:          March 26, 2016
%Last modified: April 1, 2016
%Description:   Read text file and applies fft and writes result

clear all;
clc;

% read data into array using third-party script
file_name	= '3';
file_ext	= '.txt';
file_path	= '../ansys-data/2d_arch_nv_12_full_coach_bd/';
input_path	= strcat(file_path, file_name, file_ext);
[data_array,ffn,nh,SR,hl]	= txt2mat(input_path);

head_lines  = strsplit(hl,'\n');
timestep1   = strsplit(head_lines{1},':');
dt          = str2num(timestep1{2});            % read timestep from header lines [s]
Fs			= 1/dt;								% Sampling frequency [Hz = 1/s]
data_ser_cell = strsplit(head_lines{4},',');    % contains data series
amplitude     = [];                               % define array

%loop through columns of data
for k=1:length(data_ser_cell)
    data_series = strtrim(data_ser_cell{k});
    if (isempty(data_series) == 0)              %proceed if not empty
        acc_vec		= data_array(:,k);					% input data points
        L  			= length(acc_vec);					% length of vector [-]
        acc_fft		= fft(acc_vec);						% compute fft [?]
        P2          = abs(acc_fft/L);					% two-sided spectrum [?]
        P1          = P2(1:L/2+1);						% one-sided spectrum [?]
        P1(2:end-1) = 2*P1(2:end-1);					% ?
        amplitude   = [amplitude P1];
        f           = (Fs*(0:(L/2))/L)';         		% frequency vector [Hz]
    end
end
T        = table([f],[amplitude]);					% define output matrix

% write results to file
output_path = strcat(file_path, 'fft/', file_name, file_ext); %output file name
writetable(T,output_path);                      % write to file

plot(f,amplitude)
%title('Single-Sided Amplitude Spectrum of acceleration')
%xlabel('f (Hz)')
%ylabel('|P1(f)|')