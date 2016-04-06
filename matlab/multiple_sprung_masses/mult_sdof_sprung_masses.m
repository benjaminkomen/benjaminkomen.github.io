% Title:            Multiple SDOF moving sprung masses
% Date:             February 12, 2016
% Last modified:    April 1, 2016
% Description:      Analytical-numerical solver of multiple moving sprung masses on simply supported beam

clear all;
clc;

% 1. Defining variables
n				= 1;								% number of modes
L				= 25;								% length bridge [m]
v				= 27.78;							% velocity vehicle [m/s]
g				= 9.81;								% gravitational acceleration [m/s^2]
m_vehicle		= 5750;								% mass [kg]
k_vehicle		= 1.595e6;							% spring stiffnes [N/m]
L_bogie1		= 0;								% start position bogie 1
L_bogie2		= 8;								% start position bogie 2
E_b				= 8.67e10;   						% Youngs modulus bridge [N/m^2]
m_bridge		= 2303;								% mass bridge [kg/m]
h_b             = 2.77;                             % height beam [m]
w_b             = 1.63;                             % width beam [m]
I_b				= (1/12)*w_b*h_b^3;					% Moment of inertia beam [m^4]
EI				= E_b*I_b;							% stiffness bridge [Nm^2]
t0				= 0;								% start time [s]
tf				= (2*(L+L_bogie2)/v);         		% end time [s]
nsteps          = 850;                              % amount of time steps
tspan           = linspace(t0,tf,nsteps);           % timespan for solution [s]
Omega_bridge	= (n^2*pi^2)/L^2*sqrt(EI/m_bridge);	% frequency bridge (euler-bernoulli beam) [rad/s]
Omega_bogie1	= sqrt(k_vehicle/m_vehicle);		% frequency bogie1 [rad/s]
Omega_bogie2	= sqrt(k_vehicle/m_vehicle);		% frequency bogie2 [rad/s]

% Initial conditions
y_0				= [0; 0; 0; 0; 0; 0];						% initial conditions for the equation f1, f2, f3, f4, f5 and f6 of the solver

% 2. Solve system of ODE using ode45 runga kutta solver, pass on variables
[T,Y]			= ode45(@(t1,x) odesolver_mult(t1,x,n,L_bogie1,L_bogie2,m_vehicle,v,m_bridge,L,g,Omega_bridge,Omega_bogie1,Omega_bogie2),tspan,y_0);

% Explanation:
% T = output, array of time points with related solutions
% Y = output, array of solutions for every time point
% t1 = input, current time point parameter
% x = input, current location parameter
% the rest is input

% Extract parts of solution from rows of vector
x1				= Y(:,1);							% equal to qn, time related part of bridge deflection
x2				= Y(:,2);							% equal to first time derivative of qn
x3				= Y(:,3);							% equal to uv1, first bogie deflection
x4				= Y(:,4);							% equal to first time derivate of uw1
x5				= Y(:,5);							% equal to uv2, second bogie deflection
x6				= Y(:,6);							% equal to first time derivate of uw2

% Obtain full solution for the displacement of the bridge at midspan
r				= L/2;								% midspan [m]
M_shape			= sin(pi*r/L);                      % mode shape, will result in 1 for midspan
H_bridge_x		= x1.*M_shape;						% bridge vertical position [m]
H_bogie1_x		= x3;								% bogie 1 vertical position [m]
H_bogie2_x		= x5;								% bogie 2 vertical position [m]

% Obtain velocities and accelerations by differentiation
dt              = T(2);

V_bridge_mid    = diff(H_bridge_x)./T(2);           % bridge velocity [m/s]
A_bridge_mid    = diff(V_bridge_mid)./T(2);         % bridge acceleration [m/s2]

V_bogie1       = diff(H_bogie1_x)./T(2);            % bogie1 velocity [m/s]
A_bogie1       = diff(V_bogie1)./T(2);              % bogie1 acceleration [m/s2]

V_bogie2       = diff(H_bogie2_x)./T(2);            % bogie2 velocity [m/s]
A_bogie2       = diff(V_bogie2)./T(2);              % bogie2 acceleration [m/s2]

% 3. Plot output
plot(T,H_bridge_x,'-k','LineWidth',2)
xlabel('Time [s]')
ylabel('Midpoint Displacement [m]')

% 4. Write results to file
%bridge deflection
fileID 			= fopen('0.txt','w');
fprintf(fileID,'%9s %20.16f\n','timestep:', dt);
fprintf(fileID,'%25s \n','yAxisLabel:deflection [m]');
fprintf(fileID,'%23s \n','title:bridge deflection');
fprintf(fileID,'%13s \n','matlab ub_mid');
fprintf(fileID,'%20.16f\n', H_bridge_x);
fclose(fileID);

%sprung mass displacement
fileID 			= fopen('1.txt','w');
fprintf(fileID,'%9s %20.16f\n','timestep:', dt);
fprintf(fileID,'%27s \n','yAxisLabel:vertical DOF [m]');
fprintf(fileID,'%30s \n','title:sprung mass vertical DOF');
fprintf(fileID,'%22s \n','matlab uv1, matlab uv2');
fprintf(fileID,'%20.16f, %20.16f\n', [H_bogie1_x,H_bogie2_x]');
fclose(fileID);

%sprung mass velocity
fileID 			= fopen('2.txt','w');
fprintf(fileID,'%9s %20.16f\n','timestep:', dt);
fprintf(fileID,'%25s \n','yAxisLabel:velocity [m/s]');
fprintf(fileID,'%26s \n','title:sprung mass velocity');
fprintf(fileID,'%22s \n','matlab vv1, matlab vv2');
fprintf(fileID,'%20.16f,  %20.16f\n', [V_bogie1,V_bogie2]');
fclose(fileID);

%sprung mass acceleration
fileID 			= fopen('3.txt','w');
fprintf(fileID,'%9s %20.16f\n','timestep:', dt);
fprintf(fileID,'%30s \n','yAxisLabel:acceleration [m/s2]');
fprintf(fileID,'%30s \n','title:sprung mass acceleration');
fprintf(fileID,'%22s \n','matlab av1, matlab av2');
fprintf(fileID,'%20.16f, %20.16f\n', [A_bogie1,A_bogie2]');
fclose(fileID);